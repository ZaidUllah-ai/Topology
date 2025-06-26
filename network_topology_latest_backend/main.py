from itertools import cycle
import pandas as pd
from urllib import request
from flask import Flask, request
from flask_cors import CORS
import json
# from common_puller import *
import sys
#import random
#import threading
from influxdb import InfluxDBClient
import traceback
from datetime import datetime, timedelta
# import thread

router_positions = {
    "inner": {
        "Central": [
            (950, 270),
            (670, 270),
            (670, 690),
        ],
        "Western": [
            (1000, 270),
            (1250, 270),
            (1250, 690),

        ],
        "Eastern": [
            (800, 850),
            (1100, 850),
        ]
    },
    "outer": {
        "Central": [
            (950, 50),
            (20, 50),
            (20, 1000),
        ],
        "Western": [
            (950, 50),
            (1840, 50),
            (1840, 900),
        ],
        "Eastern": [
            (350, 1100),
            (1500, 1100)
        ]
    }
}


def format_timestamp(ts):
    try:
        ts = ts.split('.')[0]
        dt = datetime.strptime(ts, "%Y-%m-%dT%H:%M:%S")
        return dt.strftime("%Y-%m-%d %H:%M:%S")
    except:
        return ts

def place_nodes_on_line(n, p1, p2):
    nodes = []

    x_step = (p2[0] - p1[0]) / (n-1) if n > 1 else 0
    y_step = (p2[1] - p1[1]) / (n-1) if n > 1 else 0

    for i in range(n):
        x = p1[0] + i * x_step
        y = p1[1] + i * y_step
        nodes.append((round(x), round(y)))

    return nodes


def place_nodes_on_square(n, p1, p2, p3):
    if n == 1:
        return [p2]
    elif n == 2:
        x1 = (p1[0]+p2[0])/2
        y1 = (p1[1]+p2[1])/2
        x2 = (p2[0]+p3[0])/2
        y2 = (p2[1]+p3[1])/2
        return [(x1, y1), (x2, y2)]
    nodes = []

    n1 = n2 = n // 2
    if n % 2 != 0:
        n1 += 1

    x_step1 = (p2[0] - p1[0]) / (n1+1) if n1 > 1 else 0
    y_step1 = (p2[1] - p1[1]) / (n1+1) if n1 > 1 else 0
    x_step2 = (p3[0] - p2[0]) / (n2+1) if n2 > 1 else 0
    y_step2 = (p3[1] - p2[1]) / (n2+1) if n2 > 1 else 0

    for i in range(1, n1+1):
        x = p1[0] + i * x_step1
        y = p1[1] + i * y_step1
        nodes.append((round(x), round(y)))

    for i in range(1, n2+1):
        x = p2[0] + i * x_step2
        nodes.append((round(x), round(y)))
        y = p2[1] + i * y_step2

    return nodes

def parse_influx_data():
    devices_dict = {}
    query = 'SELECT * FROM EDN_TOPOLOGY_STATS WHERE time > now() - 15m and time < now() GROUP BY device_name, interface_name ORDER BY time DESC LIMIT 1;'
    dbClient = InfluxDBClient('192.168.211.100', 8086, '', '', 'edn_groups')
    results = dbClient.query(query)

    query1 = 'SELECT * FROM EDN_TOPOLOGY_DEVICE_STATS WHERE time > now() - 15m and time < now() ORDER BY time;'
    dbClient = InfluxDBClient('192.168.211.100', 8086, '', '', 'edn_groups')
    device_results = dbClient.query(query1)

    query2 = 'SELECT * FROM EDN_WAN_TOPOLOGY_STATIC GROUP BY ip_address, device_id, interface_name ORDER BY time DESC;'
    dbClient = InfluxDBClient('192.168.211.100', 8086, '', '', 'edn_groups')
    static_results = dbClient.query(query2)

    cpu_dict = {}
    mem_dict = {}
    devices_dict = {}
    for devices in device_results:
        for rec in devices:
            # print(rec)
            cpu_dict[rec['ip_address']] = rec.get('cpu_utilization', 0)
            mem_dict[rec['ip_address']] = rec.get('memory_utilization', 0)

    for result in results:
        for record in result:
            # print(record)
            if record['ip_address'] not in devices_dict:
                devices_dict[record['ip_address']] = {}
            devices_dict[record['ip_address']][record['snmp_index']] = record

    # print("Number of ip_address:", len(devices_dict))
    for key in devices_dict:
        print("Number of SNPM Index for",key,":", len(devices_dict[key]), "\n")
    df = pd.read_excel("topolgy data.xlsx")
    inner = df[df['device_b'].isin(df['device_a'])]
    outer = df[~df['device_b'].isin(df['device_a'])]
    device_list = list(df.device_a.unique())
    device_list.extend(list(df.device_b.unique()))
    device_list = list(set(device_list))
    new_device_list = {
        "inner": {
            "Central": [],
            "Western": [],
            "Eastern": []
        },
        "outer": {
            "Central": [],
            "Western": [],
            "Eastern": []
        }
    }
    for device in device_list:
        region_a = df.loc[df.device_a == device]
        region_b = df.loc[df.device_b == device]
        
        if len(region_a) != 0:
            new_device_list['inner'][region_a.iloc[0].region_a].append(
                {"device": device, "id": region_a.iloc[0].device_a, "ip": region_a.iloc[0].device_a_ip, "interface": region_a.iloc[0].interface_a, 'memory_utilization': mem_dict.get(region_a.iloc[0].device_a_ip, 0), 'cpu_utilization': cpu_dict.get(region_a.iloc[0].device_a_ip, 0)})
        elif len(region_b) != 0:
            new_device_list['outer'][region_b.iloc[0].region_b].append(
                {"device": device, "id": region_b.iloc[0].device_b, "ip": "", "interface": region_b.iloc[0].interface_b, 'memory_utilization': mem_dict.get(region_b.iloc[0].device_b_ip, 0), 'cpu_utilization': cpu_dict.get(region_b.iloc[0].device_b_ip, 0)})

    for outer_key in new_device_list:
        for inner_key in new_device_list[outer_key]:
            new_device_list[outer_key][inner_key].sort(key=lambda x: x['id'])

    for outer_key in new_device_list:
        for inner_key in new_device_list[outer_key]:
            number_of_node = len(new_device_list[outer_key][inner_key])
            if len(router_positions[outer_key][inner_key]) == 3:
                positions = place_nodes_on_square(
                    number_of_node, router_positions[outer_key][inner_key][0], router_positions[outer_key][inner_key][1], router_positions[outer_key][inner_key][2])
            else:
                positions = place_nodes_on_line(
                    number_of_node, router_positions[outer_key][inner_key][0], router_positions[outer_key][inner_key][1])
            for router, position in zip(new_device_list[outer_key][inner_key], positions):
                router['position'] = {"x": position[0], "y": position[1]}

    node_list = []
    for outer_key in new_device_list:
        for inner_key in new_device_list[outer_key]:
            for router in new_device_list[outer_key][inner_key]:
                router['location'] = outer_key
                node_list.append(router)

    edges_dataframe = df[['device_a', 'device_b', 'device_a_ip', 'snmp_index', 'interface_a', 'interface_b', 'device_b_ip']].copy()
    edges_dataframe = edges_dataframe.dropna()
    edges_dataframe.snmp_index = edges_dataframe.snmp_index.astype(int)
    edges_dataframe['id'] = ['edge-'+str(i+1) for i in range(len(edges_dataframe))]
    edges_dataframe.columns = ['source', 'target', 'device_a_ip', 'snmp_index', 'interface_a', 'interface_b', 'device_b_ip', 'id']
    edges_list = edges_dataframe.to_dict('records')

    types = cycle(['straight', 'smoothstep'])

    pairs = {}
    for record in edges_list:
        pair = (record['source'], record['target'])
        if pair in pairs:
            record['type'] = "straight"
        else:
            pairs[pair] = next(types)
        pairs[pair] = next(types)

    # print("Edges List", edges_list, file=sys.stderr)
    for edge in edges_list:
        output = devices_dict.get(edge['device_a_ip'])
        if output:
            snmpOutput = output.get(str(edge['snmp_index']))
            if snmpOutput:
                # if edge['interface_a'] == 'TenGigE0/0/0/12.914':
                #   print(snmpOutput)
                edge['download_utilization'] = round(snmpOutput.get('utilization', 0), 3) # download_utilization
                edge['upload_utilization'] = round(snmpOutput.get('custom_utilization', 0), 3)
                edge['label'] = f"D-{str(edge['download_utilization'])} %, U-{str(edge['upload_utilization'])} %" # download_utilization
                edge['download'] = round(float(snmpOutput.get('traffic_in_bps', 0)) / 1000000, 2)
                edge['upload'] = round(float(snmpOutput.get('traffic_out_bps', 0)) / 1000000, 2)
                edge['high_speed'] = float(snmpOutput.get('interface_speed', 0)) // 1000000
                edge['status'] = snmpOutput.get('status', "")
                edge['errors'] = f"in-{snmpOutput.get('if_in_errors', 0)}, out-{snmpOutput.get('if_out_errors', 0)}"
                edge['packet_drops'] = f"in-{snmpOutput.get('if_in_packet_drops', 0)}, out-{snmpOutput.get('if_out_packet_drops', 0)}"
                edge['source_ip'] = edge.get('device_a_ip')
                edge['target_ip'] = edge.get('device_b_ip')
                if ('Te' in edge['interface_a'] or 'TenGigabitEthernet' in  edge['interface_a'] or 'TenGigE' in edge['interface_a']) and ("Gi" in edge['interface_b'] or "GigabitEthernet" in edge['interface_b']):
                    edge['high_speed'] = 1000
                    edge['download_utilization'] = round((edge['download'])*100/1000, 3)
                    edge['upload_utilization'] = round((edge['upload'])*100/1000, 3)
                    edge['label'] = f"D-{str(edge['download_utilization'])} %, U-{str(edge['upload_utilization'])} %"
            else:
                # print("SNMP Index not found for", edge['device_a_ip'], "where snpm index=",edge['snmp_index'])
                edge['label'] = 'D-0.0 %, U-0.0 %'
                edge['download_utilization'] = 0
                edge['upload_utilization'] = 0
                edge['download'] = 0
                edge['upload'] = 0
                edge['high_speed'] = 0
                edge['status'] = ""
                edge['errors'] = "in-0, out-0"
                edge['packet_drops'] = "in-0, out-0"
                edge['source_ip'] = edge.get('device_a_ip')
                edge['target_ip'] = edge.get('device_b_ip')
        else:
            # print("IP Address not found:",edge['device_a_ip'])
            edge['label'] = 'D-0.0 %, U-0.0 %'
            edge['download_utilization'] = 0
            edge['upload_utilization'] = 0
            edge['download'] = 0
            edge['upload'] = 0
            edge['high_speed'] = 0
            edge['status'] = ""
            edge['errors'] = "in-0, out-0"
            edge['packet_drops'] = "in-0, out-0"
            edge['source_ip'] = edge.get('device_a_ip')
            edge['target_ip'] = edge.get('device_b_ip')
        
        matching_entry = None
        if static_results:
            for rec in static_results:
                for static_entry in rec:
                    if static_entry['source_ip'] == edge['device_a_ip'] and static_entry['target_ip'] == edge['device_b_ip'] and static_entry['source'] == edge['source'] and static_entry['target'] == edge['target'] and static_entry['source_interface'] == edge['interface_a'] and static_entry['target_interface'] == edge['interface_b']:
                        matching_entry = static_entry
                        break
                if matching_entry:
                    edge['vlan_id'] = matching_entry.get('vlan_id', 'NA')
                    edge['source_upe_media_device'] = matching_entry.get('upe_media_device', 'NA')
                    edge['target_upe_media_device'] = matching_entry.get('target_upe_media_device', 'NA')
                else:
                    edge['vlan_id'] = 'NA'
                    edge['source_upe_media_device'] = 'NA'
                    edge['target_upe_media_device'] = 'NA'
        else:
            edge['vlan_id'] = 'NA'
            edge['source_upe_media_device'] = 'NA'
            edge['target_upe_media_device'] = 'NA'
            
        del edge['device_a_ip']
        del edge['snmp_index']

    return node_list, edges_list


# def parse_test_data():
#     dbClient = InfluxDBClient('192.168.211.100', 8086, '', '', 'edn_groups')
    
#     devices_dict = {}
#     query = 'SELECT * FROM EDN_TOPOLOGY_STATS WHERE time > now() - 15m and time < now() GROUP BY device_name, interface_name ORDER BY time DESC LIMIT 1;'
#     results = dbClient.query(query)

#     query1 = 'SELECT * FROM EDN_TOPOLOGY_DEVICE_STATS WHERE time > now() - 15m and time < now() ORDER BY time;'
#     device_results = dbClient.query(query1)

#     query2 = 'SELECT * FROM EDN_WAN_TOPOLOGY_STATIC GROUP BY ip_address, device_id, interface_name ORDER BY time DESC;'
#     static_results = dbClient.query(query2)
    
#     # ===== Trend Data Query ====
#     trend_query = 'SELECT SUM(custom_utilization) AS upload_utilization, SUM(utilization) AS download_utilization FROM EDN_TOPOLOGY_STATS WHERE time > now() - 1h + 5m GROUP BY time(5m), device_name, interface_name'
#     trend_results = dbClient.query(trend_query)
    
#     trend_map = {}
#     for series in trend_results.raw.get('series', []):
#         tags = series.get('tags', {})
#         values = series.get('values', [])
#         device_name = tags.get('device_name', '').split('.')[0]
#         interface_name = tags.get('interface_name')
#         key = (device_name, interface_name)
#         if key not in trend_map:
#             trend_map[key] = []
#         columns = series.get('columns', [])
#         for value in values:
#             record = dict(zip(columns, value))
#             trend_map[key].append({
#                 'time': record.get('time'),
#                 'upload_utilization_trend': record.get('upload_utilization', 0),
#                 'download_utilization_trend': record.get('download_utilization', 0)
#             })
#     # ===== End of Trend Data Query ====
    
#     cpu_dict = {}
#     mem_dict = {}
#     devices_dict = {}
#     for devices in device_results:
#         for rec in devices:
#             # print(rec)
#             cpu_dict[rec['ip_address']] = rec.get('cpu_utilization', 0)
#             mem_dict[rec['ip_address']] = rec.get('memory_utilization', 0)

#     for result in results:
#         for record in result:
#             # print(record)
#             if record['ip_address'] not in devices_dict:
#                 devices_dict[record['ip_address']] = {}
#             devices_dict[record['ip_address']][record['snmp_index']] = record

#     # print("Number of ip_address:", len(devices_dict))
#     for key in devices_dict:
#         print("Number of SNPM Index for",key,":", len(devices_dict[key]), "\n")
#     df = pd.read_excel("topolgy data.xlsx")
#     inner = df[df['device_b'].isin(df['device_a'])]
#     outer = df[~df['device_b'].isin(df['device_a'])]
#     device_list = list(df.device_a.unique())
#     device_list.extend(list(df.device_b.unique()))
#     device_list = list(set(device_list))
#     new_device_list = {
#         "inner": {
#             "Central": [],
#             "Western": [],
#             "Eastern": []
#         },
#         "outer": {
#             "Central": [],
#             "Western": [],
#             "Eastern": []
#         }
#     }
#     for device in device_list:
#         region_a = df.loc[df.device_a == device]
#         region_b = df.loc[df.device_b == device]
        
#         if len(region_a) != 0:
#             new_device_list['inner'][region_a.iloc[0].region_a].append(
#                 {"device": device, "id": region_a.iloc[0].device_a, "ip": region_a.iloc[0].device_a_ip, "interface": region_a.iloc[0].interface_a, 'memory_utilization': mem_dict.get(region_a.iloc[0].device_a_ip, 0), 'cpu_utilization': cpu_dict.get(region_a.iloc[0].device_a_ip, 0)})
#         elif len(region_b) != 0:
#             new_device_list['outer'][region_b.iloc[0].region_b].append(
#                 {"device": device, "id": region_b.iloc[0].device_b, "ip": "", "interface": region_b.iloc[0].interface_b, 'memory_utilization': mem_dict.get(region_b.iloc[0].device_b_ip, 0), 'cpu_utilization': cpu_dict.get(region_b.iloc[0].device_b_ip, 0)})

#     for outer_key in new_device_list:
#         for inner_key in new_device_list[outer_key]:
#             new_device_list[outer_key][inner_key].sort(key=lambda x: x['id'])

#     for outer_key in new_device_list:
#         for inner_key in new_device_list[outer_key]:
#             number_of_node = len(new_device_list[outer_key][inner_key])
#             if len(router_positions[outer_key][inner_key]) == 3:
#                 positions = place_nodes_on_square(
#                     number_of_node, router_positions[outer_key][inner_key][0], router_positions[outer_key][inner_key][1], router_positions[outer_key][inner_key][2])
#             else:
#                 positions = place_nodes_on_line(
#                     number_of_node, router_positions[outer_key][inner_key][0], router_positions[outer_key][inner_key][1])
#             for router, position in zip(new_device_list[outer_key][inner_key], positions):
#                 router['position'] = {"x": position[0], "y": position[1]}

#     node_list = []
#     for outer_key in new_device_list:
#         for inner_key in new_device_list[outer_key]:
#             for router in new_device_list[outer_key][inner_key]:
#                 router['location'] = outer_key
#                 node_list.append(router)

#     edges_dataframe = df[['device_a', 'device_b', 'device_a_ip', 'snmp_index', 'interface_a', 'interface_b', 'device_b_ip']].copy()
#     edges_dataframe = edges_dataframe.dropna()
#     edges_dataframe.snmp_index = edges_dataframe.snmp_index.astype(int)
#     edges_dataframe['id'] = ['edge-'+str(i+1) for i in range(len(edges_dataframe))]
#     edges_dataframe.columns = ['source', 'target', 'device_a_ip', 'snmp_index', 'interface_a', 'interface_b', 'device_b_ip', 'id']
#     edges_list = edges_dataframe.to_dict('records')

#     types = cycle(['straight', 'smoothstep'])

#     pairs = {}
#     for record in edges_list:
#         pair = (record['source'], record['target'])
#         if pair in pairs:
#             record['type'] = "straight"
#         else:
#             pairs[pair] = next(types)
#         pairs[pair] = next(types)

#     # print("Edges List", edges_list, file=sys.stderr)
#     for edge in edges_list:
#         output = devices_dict.get(edge['device_a_ip'])
#         if output:            
#             snmpOutput = output.get(str(edge['snmp_index']))
#             if snmpOutput:
#                 # if edge['interface_a'] == 'TenGigE0/0/0/12.914':
#                 #   print(snmpOutput)
#                 edge['download_utilization'] = round(snmpOutput.get('utilization', 0), 3) # download_utilization
#                 edge['upload_utilization'] = round(snmpOutput.get('custom_utilization', 0), 3)
#                 edge['label'] = f"D-{str(edge['download_utilization'])} %, U-{str(edge['upload_utilization'])} %" # download_utilization
#                 edge['download'] = round(float(snmpOutput.get('traffic_in_bps', 0)) / 1000000, 2)
#                 edge['upload'] = round(float(snmpOutput.get('traffic_out_bps', 0)) / 1000000, 2)
#                 edge['high_speed'] = float(snmpOutput.get('interface_speed', 0)) // 1000000
#                 edge['status'] = snmpOutput.get('status', "")
#                 edge['errors'] = f"in-{snmpOutput.get('if_in_errors', 0)}, out-{snmpOutput.get('if_out_errors', 0)}"
#                 edge['packet_drops'] = f"in-{snmpOutput.get('if_in_packet_drops', 0)}, out-{snmpOutput.get('if_out_packet_drops', 0)}"
#                 edge['source_ip'] = edge.get('device_a_ip')
#                 edge['target_ip'] = edge.get('device_b_ip')
                
#                 # ======= Here is the new code block to add trend utilization info =======
#                 edge['download_utilization_trend'] = []
#                 edge['upload_utilization_trend'] = []
                
#                 trend_key = (edge['source'], edge['interface_a'])
#                 trend_data = trend_map.get(trend_key)
#                 if trend_data:                    
#                     for t in trend_data:
#                         upload_value = t.get('upload_utilization_trend')
#                         download_value = t.get('download_utilization_trend')
                        
#                         if upload_value is None:
#                             upload_value = 0
                            
#                         if download_value is None:
#                             download_value = 0
                            
#                         edge['upload_utilization_trend'].append({'time': format_timestamp(t['time']),'value': round(upload_value, 3)})
#                         edge['download_utilization_trend'].append({'time': format_timestamp(t['time']),'value': round(download_value, 3)})
#                 # ========================================================================
                
#                 if ('Te' in edge['interface_a'] or 'TenGigabitEthernet' in  edge['interface_a'] or 'TenGigE' in edge['interface_a']) and ("Gi" in edge['interface_b'] or "GigabitEthernet" in edge['interface_b']):
#                     edge['high_speed'] = 1000
#                     edge['download_utilization'] = round((edge['download'])*100/1000, 3)
#                     edge['upload_utilization'] = round((edge['upload'])*100/1000, 3)
#                     edge['label'] = f"D-{str(edge['download_utilization'])} %, U-{str(edge['upload_utilization'])} %"
                    
#                     # edge['upload_utilization_trend'] = []
#                     # edge['download_utilization_trend'] = []
#                     # for t in trend_data:
#                     #     upload_value = t.get('upload_utilization_trend')
#                     #     download_value = t.get('download_utilization_trend')
                        
#                     #     if upload_value is None:
#                     #         upload_value = 0
                            
#                     #     if download_value is None:
#                     #         download_value = 0
                            
#                     edge['upload_utilization_trend'].append({'time': format_timestamp(t['time']),'value': round(upload_value*100/1000, 3)})
#                     edge['download_utilization_trend'].append({'time': format_timestamp(t['time']),'value': round(download_value*100/1000, 3)})
#             else:
#                 # print("SNMP Index not found for", edge['device_a_ip'], "where snpm index=",edge['snmp_index'])
#                 edge['label'] = 'D-0.0 %, U-0.0 %'
#                 edge['download_utilization'] = 0
#                 edge['upload_utilization'] = 0
#                 edge['download'] = 0
#                 edge['upload'] = 0
#                 edge['high_speed'] = 0
#                 edge['status'] = ""
#                 edge['errors'] = "in-0, out-0"
#                 edge['packet_drops'] = "in-0, out-0"
#                 edge['source_ip'] = edge.get('device_a_ip')
#                 edge['target_ip'] = edge.get('device_b_ip')
#                 edge['download_utilization_trend'] = []
#                 edge['upload_utilization_trend'] = []
#         else:
#             # print("IP Address not found:",edge['device_a_ip'])
#             edge['label'] = 'D-0.0 %, U-0.0 %'
#             edge['download_utilization'] = 0
#             edge['upload_utilization'] = 0
#             edge['download'] = 0
#             edge['upload'] = 0
#             edge['high_speed'] = 0
#             edge['status'] = ""
#             edge['errors'] = "in-0, out-0"
#             edge['packet_drops'] = "in-0, out-0"
#             edge['source_ip'] = edge.get('device_a_ip')
#             edge['target_ip'] = edge.get('device_b_ip')
#             edge['download_utilization_trend'] = []
#             edge['upload_utilization_trend'] = []
        
#         matching_entry = None
#         if static_results:
#             for rec in static_results:
#                 for static_entry in rec:
#                     if static_entry['source_ip'] == edge['device_a_ip'] and static_entry['target_ip'] == edge['device_b_ip'] and static_entry['source'] == edge['source'] and static_entry['target'] == edge['target'] and static_entry['source_interface'] == edge['interface_a'] and static_entry['target_interface'] == edge['interface_b']:
#                         matching_entry = static_entry
#                         break
#                 if matching_entry:
#                     edge['vlan_id'] = matching_entry.get('vlan_id', 'NA')
#                     edge['source_upe_media_device'] = matching_entry.get('upe_media_device', 'NA')
#                     edge['target_upe_media_device'] = matching_entry.get('target_upe_media_device', 'NA')
#                 else:
#                     edge['vlan_id'] = 'NA'
#                     edge['source_upe_media_device'] = 'NA'
#                     edge['target_upe_media_device'] = 'NA'
#         else:
#             edge['vlan_id'] = 'NA'
#             edge['source_upe_media_device'] = 'NA'
#             edge['target_upe_media_device'] = 'NA'
        
#         del edge['device_a_ip']
#         del edge['snmp_index']
    
#     return node_list, edges_list


def parse_test_data(trend_results=None):
    dbClient = InfluxDBClient('192.168.211.100', 8086, '', '', 'edn_groups')
    
    devices_dict = {}
    query = 'SELECT * FROM EDN_TOPOLOGY_STATS WHERE time > now() - 15m and time < now() GROUP BY device_name, interface_name ORDER BY time DESC LIMIT 1;'
    results = dbClient.query(query)

    query1 = 'SELECT * FROM EDN_TOPOLOGY_DEVICE_STATS WHERE time > now() - 15m and time < now() ORDER BY time;'
    device_results = dbClient.query(query1)

    query2 = 'SELECT * FROM EDN_WAN_TOPOLOGY_STATIC GROUP BY ip_address, device_id, interface_name ORDER BY time DESC;'
    static_results = dbClient.query(query2)
    
    # ===== Trend Data Query ====
    # trend_query = 'SELECT SUM(custom_utilization) AS upload_utilization, SUM(utilization) AS download_utilization FROM EDN_TOPOLOGY_STATS WHERE time > now() - 1h + 5m GROUP BY time(5m), device_name, interface_name'
    # trend_results = dbClient.query(trend_query)
    
    trend_map = {}
    for series in trend_results.raw.get('series', []):
        tags = series.get('tags', {})
        values = series.get('values', [])
        device_name = tags.get('device_name', '').split('.')[0]
        interface_name = tags.get('interface_name')
        key = (device_name, interface_name)
        if key not in trend_map:
            trend_map[key] = []
        columns = series.get('columns', [])
        for value in values:
            record = dict(zip(columns, value))
            trend_map[key].append({
                'time': record.get('time'),
                'upload_utilization_trend': record.get('upload_utilization_trend', 0),
                'download_utilization_trend': record.get('download_utilization_trend', 0)
            })
    # ===== End of Trend Data Query ====
    
    cpu_dict = {}
    mem_dict = {}
    devices_dict = {}
    for devices in device_results:
        for rec in devices:
            # print(rec)
            cpu_dict[rec['ip_address']] = rec.get('cpu_utilization', 0)
            mem_dict[rec['ip_address']] = rec.get('memory_utilization', 0)

    for result in results:
        for record in result:
            # print(record)
            if record['ip_address'] not in devices_dict:
                devices_dict[record['ip_address']] = {}
            devices_dict[record['ip_address']][record['snmp_index']] = record

    # print("Number of ip_address:", len(devices_dict))
    for key in devices_dict:
        print("Number of SNPM Index for",key,":", len(devices_dict[key]), "\n")
    df = pd.read_excel("topolgy data.xlsx")
    inner = df[df['device_b'].isin(df['device_a'])]
    outer = df[~df['device_b'].isin(df['device_a'])]
    device_list = list(df.device_a.unique())
    device_list.extend(list(df.device_b.unique()))
    device_list = list(set(device_list))
    new_device_list = {
        "inner": {
            "Central": [],
            "Western": [],
            "Eastern": []
        },
        "outer": {
            "Central": [],
            "Western": [],
            "Eastern": []
        }
    }
    for device in device_list:
        region_a = df.loc[df.device_a == device]
        region_b = df.loc[df.device_b == device]
        
        if len(region_a) != 0:
            new_device_list['inner'][region_a.iloc[0].region_a].append(
                {"device": device, "id": region_a.iloc[0].device_a, "ip": region_a.iloc[0].device_a_ip, "interface": region_a.iloc[0].interface_a, 'memory_utilization': mem_dict.get(region_a.iloc[0].device_a_ip, 0), 'cpu_utilization': cpu_dict.get(region_a.iloc[0].device_a_ip, 0)})
        elif len(region_b) != 0:
            new_device_list['outer'][region_b.iloc[0].region_b].append(
                {"device": device, "id": region_b.iloc[0].device_b, "ip": "", "interface": region_b.iloc[0].interface_b, 'memory_utilization': mem_dict.get(region_b.iloc[0].device_b_ip, 0), 'cpu_utilization': cpu_dict.get(region_b.iloc[0].device_b_ip, 0)})

    for outer_key in new_device_list:
        for inner_key in new_device_list[outer_key]:
            new_device_list[outer_key][inner_key].sort(key=lambda x: x['id'])

    for outer_key in new_device_list:
        for inner_key in new_device_list[outer_key]:
            number_of_node = len(new_device_list[outer_key][inner_key])
            if len(router_positions[outer_key][inner_key]) == 3:
                positions = place_nodes_on_square(
                    number_of_node, router_positions[outer_key][inner_key][0], router_positions[outer_key][inner_key][1], router_positions[outer_key][inner_key][2])
            else:
                positions = place_nodes_on_line(
                    number_of_node, router_positions[outer_key][inner_key][0], router_positions[outer_key][inner_key][1])
            for router, position in zip(new_device_list[outer_key][inner_key], positions):
                router['position'] = {"x": position[0], "y": position[1]}

    node_list = []
    for outer_key in new_device_list:
        for inner_key in new_device_list[outer_key]:
            for router in new_device_list[outer_key][inner_key]:
                router['location'] = outer_key
                node_list.append(router)

    edges_dataframe = df[['device_a', 'device_b', 'device_a_ip', 'snmp_index', 'interface_a', 'interface_b', 'device_b_ip']].copy()
    edges_dataframe = edges_dataframe.dropna()
    edges_dataframe.snmp_index = edges_dataframe.snmp_index.astype(int)
    edges_dataframe['id'] = ['edge-'+str(i+1) for i in range(len(edges_dataframe))]
    edges_dataframe.columns = ['source', 'target', 'device_a_ip', 'snmp_index', 'interface_a', 'interface_b', 'device_b_ip', 'id']
    edges_list = edges_dataframe.to_dict('records')

    types = cycle(['straight', 'smoothstep'])

    pairs = {}
    for record in edges_list:
        pair = (record['source'], record['target'])
        if pair in pairs:
            record['type'] = "straight"
        else:
            pairs[pair] = next(types)
        pairs[pair] = next(types)

    # print("Edges List", edges_list, file=sys.stderr)
    for edge in edges_list:
        output = devices_dict.get(edge['device_a_ip'])
        if output:            
            snmpOutput = output.get(str(edge['snmp_index']))
            if snmpOutput:
                # if edge['interface_a'] == 'TenGigE0/0/0/12.914':
                #   print(snmpOutput)
                edge['download_utilization'] = round(snmpOutput.get('utilization', 0), 3) # download_utilization
                edge['upload_utilization'] = round(snmpOutput.get('custom_utilization', 0), 3)
                edge['label'] = f"D-{str(edge['download_utilization'])} %, U-{str(edge['upload_utilization'])} %" # download_utilization
                edge['download'] = round(float(snmpOutput.get('traffic_in_bps', 0)) / 1000000, 2)
                edge['upload'] = round(float(snmpOutput.get('traffic_out_bps', 0)) / 1000000, 2)
                edge['high_speed'] = float(snmpOutput.get('interface_speed', 0)) // 1000000
                edge['status'] = snmpOutput.get('status', "")
                edge['errors'] = f"in-{snmpOutput.get('if_in_errors', 0)}, out-{snmpOutput.get('if_out_errors', 0)}"
                edge['packet_drops'] = f"in-{snmpOutput.get('if_in_packet_drops', 0)}, out-{snmpOutput.get('if_out_packet_drops', 0)}"
                edge['source_ip'] = edge.get('device_a_ip')
                edge['target_ip'] = edge.get('device_b_ip')
                
                # ======= Here is the new code block to add trend utilization info =======
                edge['download_utilization_trend'] = []
                edge['upload_utilization_trend'] = []
                
                trend_key = (edge['source'], edge['interface_a'])
                trend_data = trend_map.get(trend_key)
                if trend_data:                    
                    for t in trend_data:
                        upload_value = t.get('upload_utilization_trend')
                        download_value = t.get('download_utilization_trend')
                        
                        if upload_value is None:
                            upload_value = 0
                            
                        if download_value is None:
                            download_value = 0
                            
                        edge['upload_utilization_trend'].append({'time': format_timestamp(t['time']),'value': round(upload_value, 3)})
                        edge['download_utilization_trend'].append({'time': format_timestamp(t['time']),'value': round(download_value, 3)})
                # ========================================================================
                
                if ('Te' in edge['interface_a'] or 'TenGigabitEthernet' in  edge['interface_a'] or 'TenGigE' in edge['interface_a']) and ("Gi" in edge['interface_b'] or "GigabitEthernet" in edge['interface_b']):
                    edge['high_speed'] = 1000
                    edge['download_utilization'] = round((edge['download'])*100/1000, 3)
                    edge['upload_utilization'] = round((edge['upload'])*100/1000, 3)
                    edge['label'] = f"D-{str(edge['download_utilization'])} %, U-{str(edge['upload_utilization'])} %"

                    # Add trend data for high speed links                            
                    edge['upload_utilization_trend'].append({'time': format_timestamp(t['time']),'value': round(upload_value*100/1000, 3)})
                    edge['download_utilization_trend'].append({'time': format_timestamp(t['time']),'value': round(download_value*100/1000, 3)})
            else:
                # print("SNMP Index not found for", edge['device_a_ip'], "where snpm index=",edge['snmp_index'])
                edge['label'] = 'D-0.0 %, U-0.0 %'
                edge['download_utilization'] = 0
                edge['upload_utilization'] = 0
                edge['download'] = 0
                edge['upload'] = 0
                edge['high_speed'] = 0
                edge['status'] = ""
                edge['errors'] = "in-0, out-0"
                edge['packet_drops'] = "in-0, out-0"
                edge['source_ip'] = edge.get('device_a_ip')
                edge['target_ip'] = edge.get('device_b_ip')
                edge['download_utilization_trend'] = []
                edge['upload_utilization_trend'] = []
        else:
            # print("IP Address not found:",edge['device_a_ip'])
            edge['label'] = 'D-0.0 %, U-0.0 %'
            edge['download_utilization'] = 0
            edge['upload_utilization'] = 0
            edge['download'] = 0
            edge['upload'] = 0
            edge['high_speed'] = 0
            edge['status'] = ""
            edge['errors'] = "in-0, out-0"
            edge['packet_drops'] = "in-0, out-0"
            edge['source_ip'] = edge.get('device_a_ip')
            edge['target_ip'] = edge.get('device_b_ip')
            edge['download_utilization_trend'] = []
            edge['upload_utilization_trend'] = []
        
        matching_entry = None
        if static_results:
            for rec in static_results:
                for static_entry in rec:
                    if static_entry['source_ip'] == edge['device_a_ip'] and static_entry['target_ip'] == edge['device_b_ip'] and static_entry['source'] == edge['source'] and static_entry['target'] == edge['target'] and static_entry['source_interface'] == edge['interface_a'] and static_entry['target_interface'] == edge['interface_b']:
                        matching_entry = static_entry
                        break
                if matching_entry:
                    edge['vlan_id'] = matching_entry.get('vlan_id', 'NA')
                    edge['source_upe_media_device'] = matching_entry.get('upe_media_device', 'NA')
                    edge['target_upe_media_device'] = matching_entry.get('target_upe_media_device', 'NA')
                else:
                    edge['vlan_id'] = 'NA'
                    edge['source_upe_media_device'] = 'NA'
                    edge['target_upe_media_device'] = 'NA'
        else:
            edge['vlan_id'] = 'NA'
            edge['source_upe_media_device'] = 'NA'
            edge['target_upe_media_device'] = 'NA'
        
        del edge['device_a_ip']
        del edge['snmp_index']
    
    return node_list, edges_list




def parse_test_data_filtered(duration="1h"):
    dbClient = InfluxDBClient('192.168.211.100', 8086, '', '', 'edn_groups')
    trend_query = f'''
                    SELECT 
                        SUM(custom_utilization) AS upload_utilization_trend, 
                        SUM(utilization) AS download_utilization_trend 
                    FROM 
                        EDN_TOPOLOGY_STATS 
                    WHERE 
                        time > now() - {duration} + 5m
                    GROUP BY 
                        time(5m), device_name, interface_name 
                '''
    return dbClient.query(trend_query)


app = Flask(__name__)
CORS(app=app, resources="*")

# get /topInterfaceUtilizations data= [{link:"router1-router2", percentage: 80}, ...]


@app.route("/topInterfaceUtilizations", methods=["GET"])
def topInterfaceUtilizations():
    node_list, edges_list = parse_influx_data()
    output = []
    for edge in edges_list:
        output.append({"routerA": edge['source'], "routerB": edge['target'], "routerAInterface": edge['interface_a'], "routerBInterface": edge['interface_b'],
                    "download_percentage": round(float(edge['download_utilization']), 3), "upload_percentage": round(float(edge['upload_utilization']), 3)})
    output.sort(key=lambda x: max(x['download_percentage'], x['upload_percentage']), reverse=True)
    output = output[:5]
    return json.dumps(output)


@app.route("/get-routers", methods=["GET"])
def get_routers():
    node_list, edges_list = parse_influx_data()
    return {"node_list": node_list, "edges_list": edges_list}, 200


# @app.route("/get-test-routers", methods=["GET"])
# def get_test_routers():
#     node_list, edges_list = parse_test_data()
#     return {"node_list": node_list, "edges_list": edges_list}, 200

@app.route("/get-test-routers", methods=["GET"])
def get_test_routers():
    try:
        duration = request.args.get("duration", "1h")
        trend_results = parse_test_data_filtered(duration=duration)
        node_list, edges_list = parse_test_data(trend_results)
        return {"node_list": node_list, "edges_list": edges_list}, 200
    except Exception as e:
        traceback.print_exc()
        return str(e), 500



@app.route("/getAllSwitchesWan", methods=["GET"])
def GetAllSwitchesWan():
    try:
        node_list, edges_list = parse_influx_data()
        output = []
        for edge in edges_list:
            output.append({"source_ip": edge['source_ip'], "target_ip": edge['target_ip'], "source": edge['source'], "target": edge['target'], "source_interface": edge['interface_a'], "target_interface": edge['interface_b'], "vlan_id": edge['vlan_id'], "source_upe_media_device": edge['source_upe_media_device'], "target_upe_media_device": edge['target_upe_media_device']})

        return json.dumps(output)
    except Exception as e:
        traceback.print_exc()
        return str(e), 500

@app.route("/addStaticData", methods=["POST"])
def AddStaticData():
    try:

        objs = request.get_json()
        print("Data is: ", objs)

        interfaces_data = [{
            "measurement": "EDN_WAN_TOPOLOGY_STATIC",
            "tags": {
                "source_ip"  : objs['source_ip'],
                "target_ip"  : objs['target_ip'],
                "source" : objs['source'],
                "target" : objs['target'],
                "source_interface" : objs['source_interface'],
                "target_interface" : objs['target_interface']
            },
            "time": datetime.now().strftime('%Y-%m-%dT%H:%M:%SZ'),
            "fields": {
                "vlan_id" : objs['vlan_id'],
                "upe_media_device" : objs['source_upe_media_device'],
                "target_upe_media_device" : objs['target_upe_media_device']
            }
        }]

        try:

            client = InfluxDBClient(host='192.168.211.100', port=8086)
            client.switch_database('edn_groups')
            
            if(client.write_points(interfaces_data)):
                print(f"{objs['source']}: {objs['source_interface']} data is pushed")
            else:
                print(f"{objs['source']}: {objs['source_interface']} data not pushed")
            
            return "Success"

        except Exception as e:
            print(f"Database connection issue: {e}")
            return e

    except Exception as e:
        traceback.print_exc()
        return str(e), 500

@app.route("/", methods=["GET"])
def health():
    return "Working", 200


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5005)
