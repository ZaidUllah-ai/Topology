from threading import Thread
from pysnmp.hlapi import *
from influxdb import InfluxDBClient
from datetime import datetime
import re
import mysql.connector, time
import traceback
import re
import json

user = 'SOLARWINDS-USER'
auth_key = 'T%$67treBg568E@'
auth_protocol = usmHMACSHAAuthProtocol

hosts = []
port = 161
timeout = 1
retries = 5
time_format = '%Y-%m-%dT%H:%M:%SZ'

oids = {
    'Device Name': '1.3.6.1.2.1.1.5',
    'device_description': '1.3.6.1.2.1.1.1',
    'interfaces_name': '1.3.6.1.2.1.31.1.1.1.1',
    'interface_status': '1.3.6.1.2.1.2.2.1.7',
    'interface_description': '1.3.6.1.2.1.2.2.1.2',
    'download': '1.3.6.1.2.1.31.1.1.1.6',
    'upload': '1.3.6.1.2.1.31.1.1.1.10',
    "highspeed": '1.3.6.1.2.1.31.1.1.1.15',
    "in_errors": "1.3.6.1.2.1.2.2.1.14",
    "out_errors": "1.3.6.1.2.1.2.2.1.20",
    "in_discards": "1.3.6.1.2.1.2.2.1.13",
    "out_discards": "1.3.6.1.2.1.2.2.1.19"
}

cisco_ios_oids = {
    'cpu_utilization': '1.3.6.1.4.1.9.2.1.56',
    'memory_used': '1.3.6.1.4.1.9.9.48.1.1.1.5',
    'memory_free': '1.3.6.1.4.1.9.9.48.1.1.1.6'
}

cisco_ios_xr_oids = {
    'cpu_utilization': ('1.3.6.1.4.1.9.9.109.1.1.1.1.7', '33313'),
    'memory_used': ('1.3.6.1.4.1.9.9.221.1.1.1.1.18', '8289.1'),
    'memory_free': ('1.3.6.1.4.1.9.9.221.1.1.1.1.20', '8289.1')
}


def parseMemory(memory_data):
    memory = 0.0
    memoryList = interfaces(memory_data)
    for key in memoryList.keys():
        memory += float(memoryList[key][0])

    return memory, len(memoryList.keys())


def getCpuUtilization(host, sw_type, engn, community, transport, cnxt, oid):
    cpu = 0
    try:
        value = None
        cpu_list = {}
        if sw_type == 'cisco_ios_xr':

            if len(oid) != 2:
                print(f"{host}: IOS-XR - Error in CPU - Invalid SNMP OID & Index")
                return "NA"

            value = get_oid_data(
                engn, community, transport, cnxt, oid[0])

            if value is None or value == 'NA':
                value = "NA"
            else:
                cpu_list = interfaces(value)

                if oid[1] in cpu_list.keys():
                    cpu_list = {
                        oid[1]: cpu_list[oid[1]]
                    }
                else:
                    print(f"{host}: IOS-XR - Error in CPU - SNMP Index Does Not Match")
        else:
            value = get_oid_data(
                engn, community, transport, cnxt, oid)
            if value is None or value == 'NA':
                value = "NA"
            else:
                cpu_list = interfaces(value)

        if value == 'NA':
            cpu = 'NA'
        else:
            for key in cpu_list.keys():
                cpu += int(cpu_list[key][0])
            if cpu > 0:
                cpu = int(cpu / (len(cpu_list.keys())))
    except:
        print(f"{host}: Error in CPU")
        traceback.print_exc()
        cpu = "NA"

    print(f"{host}: CPU Utilization : {cpu}")
    return cpu


def getMemoryUtilization(host, sw_type, engn, community, transport, cnxt, oids):
    memory_util = 0.0

    if sw_type == 'cisco_ios_xr':
        try:
            if len(oids['memory_used']) != 2 and len(oids['memory_free']) != 2:
                print(f"{host}: IOS-XR - Error in CPU - Invalid SNMP OID & Index")
                return "NA"

            if 'memory_used' in oids.keys() and 'memory_free' in oids.keys():
                # Get Memory Used
                memory_used = get_oid_data(
                    engn, community, transport, cnxt, oids['memory_used'][0])

                if memory_used is None or memory_used == 'NA':
                    memory_used = "0.0"
                else:
                    memory_used = interfaces_with_index(memory_used)
                    if oids['memory_used'][1] in memory_used.keys():
                        memory_used = memory_used[oids['memory_used'][1]][0]
                        # print(f"{host}: Memory Used: {memory_used}")
                    else:
                        print(f"{host}: IOS-XR - Error in MEMORY - SNMP Index Does Not Match")

                # Get Memory Free
                memory_free = get_oid_data(
                    engn, community, transport, cnxt, oids['memory_free'][0])

                if memory_free is None or memory_free == 'NA':
                    memory_free = "0.0"
                else:
                    memory_free = interfaces_with_index(memory_free)
                    if oids['memory_free'][1] in memory_free.keys():
                        memory_free = memory_free[oids['memory_free'][1]][0]
                        # print(f"{host}: Memory Free: {memory_free}")
                    else:
                        print(f"{host}: IOS-XR - Error in MEMORY - SNMP Index Does Not Match")

                if memory_used == 0.0 and memory_free == 0.0:
                    memory_util = 0.0
                else:
                    memory_util = float((float(memory_used) * 100) / (float(memory_used) + float(memory_free)))
            else:
                print(
                    f"{host}: Error : Memory Used Or Memory Free OID Not Given")
        except Exception as e:
            print(f"{host}: Error in Memory Utilization")
            traceback.print_exc()

    else:
        try:
            if 'memory_used' in oids.keys() and 'memory_free' in oids.keys():
                memory_used = get_oid_data(
                    engn, community, transport, cnxt, oids['memory_used'])

                memory_used = float(parseMemory(memory_used)[0])
                # print(f"{host}: Memory Used: {memory_used}")

                if memory_used is None or memory_used == 'NA':
                    memory_used = "0.0"

                memory_free = get_oid_data(
                    engn, community, transport, cnxt, oids['memory_free'])

                memory_free = float(parseMemory(memory_free)[0])
                # print(f"{host}: Memory Free: {memory_free}")

                if memory_free is None or memory_free == 'NA':
                    memory_free = "0.0"

                if memory_used == 0.0 and memory_free == 0.0:
                    memory_util = 0.0
                else:
                    print("Memory used", memory_used)
                    print("Memory free", memory_free)
                    memory_util = (memory_used * 100) / (memory_used + memory_free)
            else:
                print(
                    f"{host}: Error : Memory Used Or Memory Free OID Not Given")
        except Exception as e:
            print(f"{host}: Error in Memory Utilization")
            traceback.print_exc()
    if memory_util != 0.0:
        memory_util = round(memory_util, 2)
    print(f"{host}: Memory Utilization : {memory_util}")
    return memory_util


def get_oid_data(engn, community, transport, cnxt, oid):
    try:
        # print(f"SNMP walk started for OID {oid}", )

        oid = ObjectType(ObjectIdentity(oid))
        all = []

        for (errorIndication, errorStatus, errorIndex, varBinds) in nextCmd(engn, community, transport, cnxt, oid,
                                                                            lexicographicMode=False):

            if errorIndication:
                print(f'error=>{errorIndication}')

            elif errorStatus:
                print('%s at %s' % (errorStatus.prettyPrint(),
                                    errorIndex and varBinds[int(errorIndex) - 1][0] or '?'))
            else:
                for varBind in varBinds:
                    all.append(varBind)
        return all
    except Exception as e:
        print(f"Failed to run SNMP walk: {e}", )
        return []


def general(varbinds):
    for varBind in varbinds:
        res = ' = '.join([x.prettyPrint() for x in varBind])
        if 'No Such Instance' not in res:
            result = res.split('=')[1].strip()

            return result


def interfaces(varbinds):
    intefaces_val = dict()
    for varbind in varbinds:
        out = re.search(r'\d* .*', str(varbind)).group()
        value = out.split('=')
        intefaces_val[value[0].strip()] = [value[1].strip()]

    return intefaces_val


def interfaces_with_index(varbinds):
    intefaces_val = dict()
    for varbind in varbinds:
        out = re.search(r'(\d+\.\d+)\s*=\s*(\d+)', str(varbind)).group()
        value = out.split('=')
        intefaces_val[value[0].strip()] = [value[1].strip()]

    return intefaces_val


class Poller():

    def __init__(self):
        self.ThreadCounter = 0
        self.connections_limit = 64
        self.ThreadDoneCounter = 0
        self.devices = []
        self.new_devices = []
        self.device_interfaces = dict()
        self.current_time = datetime.utcnow().strftime(time_format)
        self.current_snapshot = {"time": self.current_time, "data": {}}
        self.prev_snapshot = {}

        try:
            self.prev_snapshot = json.load(open("/home/Scripts/ciscomns/edn/pollers/poller_edn_stats/snapshot.json"))
            # print("printing data of previous",self.prev_snapshot)
            self.tdelta = datetime.strptime(self.current_time, time_format) - datetime.strptime(
                self.prev_snapshot['time'], time_format)

        except Exception as e:

            print(str(e))

    def poll(self, host):

        self.current_snapshot["data"][host] = {}
        con_exception = None
        engn = None
        community = None
        transport = None
        cnxt = None
        interfaces_name = dict()

        try:
            engn = SnmpEngine()
            community = UsmUserData(userName='SWV3', authKey='snM9v3m08', privKey='3Nt56m08',
                                    authProtocol=usmHMACSHAAuthProtocol, privProtocol=usmAesCfb128Protocol)
            transport = UdpTransportTarget((host, 161))
            # transport = UdpTransportTarget((host, 161), timeout=5.0, retries=1)
            cnxt = ContextData()
        except Exception as e:
            con_exception = e
            print(str(e))
        if con_exception == None:
            device = dict()
            device['ip'] = host

            # Device name
            try:
                temp = get_oid_data(engn, community, transport, cnxt, oids['Device Name'])
                device['name'] = str(general(temp))
            except Exception as e:
                print(str(e), )

            temp = get_oid_data(engn, community, transport, cnxt, oids['interfaces_name'])
            interfaces_name = interfaces(temp)

            try:
                temp = get_oid_data(engn, community, transport, cnxt, oids['interface_status'])
                interface_status = interfaces(temp)
                for key, value in interface_status.items():
                    if interface_status[key][0] == '1':
                        interface_status[key][0] = 'Up'
                    else:
                        interface_status[key][0] = 'Down'
            except:
                interface_status = 'NA'

            temp = get_oid_data(engn, community, transport, cnxt, oids['download'])
            download_val = interfaces(temp)
            temp = get_oid_data(engn, community, transport, cnxt, oids['upload'])
            upload_val = interfaces(temp)
            temp = get_oid_data(engn, community, transport, cnxt, oids['highspeed'])
            high_val = interfaces(temp)
            interface = dict()
            self.devices.append(device)
            self.device_interfaces[device['name']] = list()

            # Get CRC Errors
            temp = get_oid_data(engn, community, transport, cnxt, oids['in_errors'])
            inErrors = interfaces(temp)
            temp = get_oid_data(engn, community, transport, cnxt, oids['out_errors'])
            outErrors = interfaces(temp)

            # Get Packet Discard Errors
            temp = get_oid_data(engn, community, transport, cnxt, oids['in_discards'])
            inDiscards = interfaces(temp)
            temp = get_oid_data(engn, community, transport, cnxt, oids['out_discards'])
            outDiscards = interfaces(temp)

            for key in interfaces_name.keys():
                if (key in inErrors.keys() or key in outErrors.keys()):
                    ifInErrors = inErrors[key][0]
                    ifOutErrors = outErrors[key][0]
                    # crc_errors = int(int(ifInErrors) + int(ifOutErrors))
                    # print("CRC Errors  ", crc_errors)
                else:
                    ifInErrors, ifOutErrors = "0", "0"
                if (key in inDiscards.keys() or key in outDiscards.keys()):
                    ifInDiscards = inDiscards[key][0]
                    ifOutDiscards = outDiscards[key][0]
                    # packet_discard_errors = int(int(ifInDiscards) + int(ifOutDiscards))
                    # print("Packet Discards  ", packet_discard_errors)
                else:
                    ifInDiscards, ifOutDiscards = "0", "0"

                if (key in download_val.keys() or key in upload_val.keys()):

                    # if int(high_val[key][0]) == 0:
                    #    continue

                    interface_speed = int(high_val[key][0]) * 1000000
                    bandwidth = int(interface_speed) / 1000000000
                    # custom_utilization = int(int(int(download_val[key][0])/1000000) + int(int(upload_val[key][0])/1000000) * 100) / int(high_val[key][0])

                    self.current_snapshot["data"][host][key] = {'index': key, 'name': interfaces_name[key][0],
                                                                'ifHCInOctets': int(download_val[key][0]),
                                                                'ifHCOutOctets': int(upload_val[key][0]),
                                                                'ifHighSpeed': interface_speed,
                                                                'status': interface_status[key][0]}

                    try:

                        if any(
                                [
                                    self.prev_snapshot is None,
                                    "data" not in self.prev_snapshot,
                                    host not in self.prev_snapshot["data"],
                                    key not in self.prev_snapshot["data"][host],
                                    'ifHCInOctets' not in self.prev_snapshot["data"][host][key],
                                    'ifHCOutOctets' not in self.prev_snapshot["data"][host][key]
                                ]):
                            try:
                                interface = {'index': key, 'name': interfaces_name[key][0],
                                             'traffic_in_bps': int(download_val[key][0]),
                                             'traffic_out_bps': int(upload_val[key][0]),
                                             'interface_speed': interface_speed, 'bandwidth': int(bandwidth),
                                             'utilization': 0, 'custom_utilization': 0.0,
                                             'status': interface_status[key][0], 'if_in_errors': 0, 'if_out_errors': 0,
                                             'if_in_packet_drops': 0, 'if_out_packet_drops': 0}

                                self.device_interfaces[device['name']].append(interface)
                            except Exception as e:
                                print("exception in  interfaces dictionary:", str(e))
                                traceback.print_exc()
                                pass

                        else:
                            try:
                                diff_in_octets = ((int(download_val[key][0]) - int(
                                    self.prev_snapshot["data"][host][key]['ifHCInOctets'])) * 8) / self.tdelta.seconds
                                diff_out_octets = ((int(upload_val[key][0]) - int(
                                    self.prev_snapshot["data"][host][key]['ifHCOutOctets'])) * 8) / self.tdelta.seconds

                                if any(
                                        [
                                            diff_in_octets < 0,
                                            diff_out_octets < 0,
                                            diff_in_octets > interface_speed,
                                            diff_out_octets > interface_speed
                                        ]
                                ):
                                    continue

                                download_utilization = ((diff_in_octets) / interface_speed) * 100 if interface_speed !=0 else 0
                                upload_utilization = ((diff_out_octets) / interface_speed) * 100 if interface_speed !=0 else 0

                                interface = {'index': key, 'name': interfaces_name[key][0],
                                             'traffic_in_bps': int(diff_in_octets),
                                             'traffic_out_bps': int(diff_out_octets),
                                             'interface_speed': int(interface_speed), 'bandwidth': int(bandwidth),
                                             'utilization': download_utilization,
                                             'custom_utilization': upload_utilization,
                                             'status': interface_status[key][0], 'if_in_errors': ifInErrors,
                                             'if_out_errors': ifOutErrors, 'if_in_packet_drops': ifInDiscards,
                                             'if_out_packet_drops': ifOutDiscards}

                                # print(interface)
                                self.current_snapshot["data"][host][key] = {'name': interfaces_name[key][0],
                                                                            'ifHCInOctets': int(download_val[key][0]),
                                                                            'ifHCOutOctets': int(upload_val[key][0]),
                                                                            'ifHighSpeed': interface_speed,
                                                                            'status': interface_status[key][0]}

                                self.device_interfaces[device['name']].append(interface)

                            except Exception as e:
                                print("exception in  interfaces dictionary:", str(e))
                                traceback.print_exc()
                                pass
                    except Exception as e:
                        print(e)
                        print(traceback.format_exc())
                        continue
                else:
                    continue
        self.ThreadCounter -= 1
        self.ThreadDoneCounter += 1

    def pollDevices(self, host):

        self.current_snapshot["data"][host] = {}
        con_exception = None
        engn = None
        community = None
        transport = None
        cnxt = None
        interfaces_name = dict()

        try:
            engn = SnmpEngine()
            community = UsmUserData(userName='SWV3', authKey='snM9v3m08', privKey='3Nt56m08',
                                    authProtocol=usmHMACSHAAuthProtocol, privProtocol=usmAesCfb128Protocol)
            transport = UdpTransportTarget((host, 161))
            # transport = UdpTransportTarget((host, 161), timeout=5.0, retries=1)
            cnxt = ContextData()
        except Exception as e:
            con_exception = e
            print(str(e))
        if con_exception == None:
            device = dict()
            device['ip'] = host

            ips_list = [
                {"ip_address": "10.64.0.3", "sw_type": "cisco_ios_xr"},
                {"ip_address": "10.66.0.3", "sw_type": "cisco_ios_xr"},
                {"ip_address": "10.83.0.3", "sw_type": "cisco_ios_xr"},
                {"ip_address": "10.78.0.3", "sw_type": "cisco_ios_xr"},
                {"ip_address": "10.42.0.3", "sw_type": "cisco_ios_xr"},
                {"ip_address": "10.41.0.3", "sw_type": "cisco_ios_xr"},
                {"ip_address": "10.5.0.3", "sw_type": "cisco_ios_xr"},
                {"ip_address": "10.70.0.3", "sw_type": "cisco_ios_xe"},
                {"ip_address": "10.14.106.151", "sw_type": "cisco_ios_xr"},
                {"ip_address": "10.67.0.5", "sw_type": "cisco_ios_xr"},
                {"ip_address": "10.73.0.3", "sw_type": "cisco_ios_xe"},
                {"ip_address": "10.8.160.3", "sw_type": "cisco_ios_xe"},
                {"ip_address": "10.6.0.134", "sw_type": "cisco_ios"},
                {"ip_address": "10.68.0.3", "sw_type": "cisco_ios"},
                {"ip_address": "10.5.0.4", "sw_type": "cisco_ios_xr"},
                {"ip_address": "10.70.0.4", "sw_type": "cisco_ios_xe"},
                {"ip_address": "10.14.106.152", "sw_type": "cisco_ios_xr"},
                {"ip_address": "10.67.0.6", "sw_type": "cisco_ios_xr"},
                {"ip_address": "10.73.0.4", "sw_type": "cisco_ios_xe"},
                {"ip_address": "10.8.160.4", "sw_type": "cisco_ios_xe"},
                {"ip_address": "10.6.0.135", "sw_type": "cisco_ios"},
                {"ip_address": "10.68.0.4", "sw_type": "cisco_ios"},
                {"ip_address": "10.84.0.3", "sw_type": "cisco_ios"},
                {"ip_address": "10.81.0.3", "sw_type": "cisco_ios_xe"},
                {"ip_address": "10.85.0.3", "sw_type": "cisco_ios_xe"},
                {"ip_address": "10.87.0.3", "sw_type": "cisco_ios_xe"},
                {"ip_address": "10.82.0.3", "sw_type": "cisco_ios_xe"},
                {"ip_address": "10.22.0.153", "sw_type": "cisco_ios_xe"},
                {"ip_address": "10.20.0.3", "sw_type": "cisco_ios_xe"},
                {"ip_address": "10.20.0.4", "sw_type": "cisco_ios_xe"},
                {"ip_address": "10.22.0.149", "sw_type": "cisco_ios_xe"},
                {"ip_address": "10.87.0.4", "sw_type": "cisco_ios_xe"},
                {"ip_address": "10.85.0.4", "sw_type": "cisco_ios_xe"},
                {"ip_address": "10.81.0.4", "sw_type": "cisco_ios_xe"},
                {"ip_address": "10.84.0.4", "sw_type": "cisco_ios"},
                {"ip_address": "10.82.0.4", "sw_type": "cisco_ios_xe"},
                {"ip_address": "10.32.0.3", "sw_type": "cisco_ios"},
                {"ip_address": "10.76.0.3", "sw_type": "cisco_ios_xe"},
                {"ip_address": "10.35.0.3", "sw_type": "cisco_ios_xe"},
                {"ip_address": "10.32.0.4", "sw_type": "cisco_ios"},
                {"ip_address": "10.76.0.4", "sw_type": "cisco_ios_xe"},
                {"ip_address": "10.35.0.4", "sw_type": "cisco_ios_xe"},
                {"ip_address": "10.64.150.151", "sw_type": "cisco_ios_xr"},
                {"ip_address": "10.78.1.23", "sw_type": "cisco_ios_xr"},
                {"ip_address": "10.41.0.3", "sw_type": "cisco_ios_xr"},
                {"ip_address": "10.41.1.82", "sw_type": "cisco_ios_xr"},
                {"ip_address": "10.42.1.138", "sw_type": "cisco_ios_xr"},
                {"ip_address": "10.66.1.152", "sw_type": "cisco_ios_xr"}
            ]
            found_object = next((obj for obj in ips_list if obj["ip_address"] == host), None)
            if found_object:
                sw_type = found_object["sw_type"]
                print(f"IP address {host} found. Corresponding sw_type: {sw_type}")
                if sw_type == "cisco_ios":
                    cpu_utilization = getCpuUtilization(host, sw_type, engn, community, transport, cnxt,
                                                        cisco_ios_oids['cpu_utilization'])
                    memory_utilization = getMemoryUtilization(host, sw_type, engn, community, transport, cnxt,
                                                              cisco_ios_oids)
                elif sw_type == "cisco_ios_xe":
                    cpu_utilization = getCpuUtilization(host, sw_type, engn, community, transport, cnxt,
                                                        cisco_ios_oids['cpu_utilization'])
                    memory_utilization = getMemoryUtilization(host, sw_type, engn, community, transport, cnxt,
                                                              cisco_ios_oids)
                elif sw_type == "cisco_ios_xr":
                    cpu_utilization = getCpuUtilization(host, sw_type, engn, community, transport, cnxt,
                                                        cisco_ios_xr_oids['cpu_utilization'])
                    memory_utilization = getMemoryUtilization(host, sw_type, engn, community, transport, cnxt,
                                                              cisco_ios_xr_oids)
                else:
                    print(f"\n-------- {host}: Support Not Available for {sw_type} --------\n")
            else:
                print(f"IP address {host} not found in the array.")
            device['cpu_utilization'] = cpu_utilization
            device['memory_utilization'] = memory_utilization

            self.new_devices.append(device)

        self.ThreadCounter -= 1
        self.ThreadDoneCounter += 1

    def run(self):

        time_stamp = datetime.utcnow().strftime(time_format)

        hosts = ['10.64.0.3', '10.66.0.3', '10.83.0.3', '10.78.0.3', '10.42.0.3', '10.41.0.3']
        threads = []
        self.Total = 1
        self.Total = len(hosts)

        # ['10.64.0.3', 'migw1234', '161']
        for host in hosts:
            th = Thread(target=self.poll, args={str(host)})

            threads.append(th)
        ThreadIndex = 0

        while (self.ThreadCounter < self.connections_limit):

            threads[ThreadIndex].start()
            ThreadIndex += 1
            self.ThreadCounter += 1
            # print("(%d/%d/%d)InQ=%d" % (ThreadIndex, self.ThreadDoneCounter, self.Total, self.ThreadCounter))

            while (self.ThreadCounter == self.connections_limit - 1):
                time.sleep(0.01)

            if ThreadIndex == self.Total:
                for thrd in threads:
                    thrd.join()
                break
        print(self.devices)
        output_test = {}
        for device in self.devices:
            new_output_test = {}
            for interface in self.device_interfaces[device['name']]:
                new_output_test.setdefault(interface['index'], [])
                new_output_test[interface['index']].append({
                    "ip_address": device['ip'],
                    "device_name": device['name'],
                    "interface_name": interface['name'],
                    "status": interface['status'],
                    "traffic_in_bps": float(interface['traffic_in_bps']),
                    "traffic_out_bps": float(interface['traffic_out_bps']),
                    "interface_speed": interface['interface_speed'],
                    "bandwidth": interface['bandwidth'],
                    "utilization": interface['utilization'],
                    "custom_utilization": interface['custom_utilization'],
                    "if_in_errors": interface['if_in_errors'],
                    "if_out_errors": interface['if_out_errors'],
                    "if_in_packet_drops": interface['if_in_packet_drops'],
                    "if_out_packet_drops": interface['if_out_packet_drops']
                })
            output_test[device['ip']] = new_output_test
        for dev in output_test:
            print("Device: ", dev)
            for key in output_test[dev]:
                print("\tSNMP INDEX: ", key)
                for inner_data in output_test[dev][key]:
                    for inner_key in inner_data:
                        print("\t\t", inner_key, inner_data[inner_key])

        devices_data = []
        for device in self.devices:

            for interface in self.device_interfaces[device['name']]:
                interfaces_data = [{
                    "measurement": "EDN_TOPOLOGY_STATS",
                    "tags": {
                        "ip_address": device['ip'],
                        "device_name": device['name'],
                        "interface_name": interface['name'],
                    },
                    "time": time_stamp,
                    "fields": {
                        "snmp_index": interface['index'],
                        "status": interface['status'],
                        "traffic_in_bps": float(interface['traffic_in_bps']),
                        "traffic_out_bps": float(interface['traffic_out_bps']),
                        "interface_speed": interface['interface_speed'],
                        "bandwidth": interface['bandwidth'],
                        "utilization": float(interface['utilization']),
                        "custom_utilization": float(interface['custom_utilization']),
                        "if_in_errors": interface['if_in_errors'],
                        "if_out_errors": interface['if_out_errors'],
                        "if_in_packet_drops": interface['if_in_packet_drops'],
                        "if_out_packet_drops": interface['if_out_packet_drops']
                    }
                }]

                try:

                    client = InfluxDBClient(host='192.168.211.100', port=8086)
                    # client.switch_database('igw_groups_all')
                    client.switch_database('edn_groups')
                    print(type(interfaces_data[0]["fields"]["custom_utilization"]))
                    if (client.write_points(interfaces_data)):
                        print(f"{device['name']}: {interface['name']} data is pushed for {interface['index']} \n\n\n")
                    else:
                        print(f"{device['name']}: {interface['name']} data not pushed for {interface['index']} \n\n\n")

                except Exception as e:
                    print(f"Database connection issue: {e}")
                    print(interfaces_data)
                    return e

        json.dump(self.current_snapshot, open("/home/Scripts/ciscomns/edn/pollers/poller_edn_stats/snapshot.json", "w"))

    def runDevices(self):
        print("########### STARTING DEVICE POLLER ###########")
        time_stamp = datetime.utcnow().strftime(time_format)
        hosts = [
            '10.64.0.3', '10.66.0.3', '10.83.0.3', '10.78.0.3', '10.42.0.3',
            '10.41.0.3', "10.5.0.3", "10.70.0.3", "10.14.106.151", "10.67.0.5",
            "10.73.0.3", "10.8.160.3", "10.6.0.134", "10.68.0.3", "10.5.0.4",
            "10.70.0.4", "10.14.106.152", "10.67.0.6", "10.73.0.4", "10.8.160.4",
            "10.6.0.135", "10.68.0.4", "10.84.0.3", "10.81.0.3", "10.85.0.3",
            "10.87.0.3", "10.82.0.3", "10.22.0.153", "10.20.0.3", "10.20.0.4",
            "10.22.0.149", "10.87.0.4", "10.85.0.4", "10.81.0.4", "10.84.0.4",
            "10.82.0.4", "10.32.0.3", "10.76.0.3", "10.35.0.3", "10.32.0.4",
            "10.76.0.4", "10.35.0.4", "10.64.150.151", "10.78.1.23", "10.41.0.3",
            "10.41.1.82", "10.42.1.138", "10.66.1.152"
        ]
        threads = []
        self.Total = 1
        self.Total = len(hosts)

        # ['10.64.0.3', 'migw1234', '161']
        for host in hosts:
            th = Thread(target=self.pollDevices, args={str(host)})

            threads.append(th)
        ThreadIndex = 0

        while (self.ThreadCounter < self.connections_limit):

            threads[ThreadIndex].start()
            ThreadIndex += 1
            self.ThreadCounter += 1
            # print("(%d/%d/%d)InQ=%d" % (ThreadIndex, self.ThreadDoneCounter, self.Total, self.ThreadCounter))

            while (self.ThreadCounter == self.connections_limit - 1):
                time.sleep(0.01)

            if ThreadIndex == self.Total:
                for thrd in threads:
                    thrd.join()
                break
                output_test = {}


        for device in self.new_devices:

            interfaces_data = []

            interfaces_data = [{
                "measurement": "EDN_TOPOLOGY_DEVICE_STATS",
                "tags": {
                    "ip_address": device['ip'],
                },
                "time": time_stamp,
                "fields": {
                    "cpu_utilization": device['cpu_utilization'],
                    "memory_utilization": device['memory_utilization'],
                }
            }]

            try:

                client = InfluxDBClient(host='192.168.211.100', port=8086)
                # client.switch_database('igw_groups_all')
                client.switch_database('edn_groups')

                if (client.write_points(interfaces_data)):
                    print(f"{device['ip']}: data is pushed")
                else:
                    print(f"{device['ip']}: data not pushed")

            except Exception as e:
                print(f"Database connection issue: {e}")
                return e


if __name__ == "__main__":

    try:
        print('Started at: ' + datetime.now().strftime('%Y-%m-%dT%H:%M:%S'))
        main = Poller()
        main.run()
        main.runDevices()
    except Exception as e:
        msg = datetime.now().strftime('%Y-%m-%dT%H:%M:%S') + ' : ' + str(e)
        print(msg)
        print(traceback.format_exc())


