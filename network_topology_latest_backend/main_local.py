from flask import Flask, jsonify
from flask_cors import CORS  # 👈 Import CORS
import json

app = Flask(__name__)
CORS(app)  # 👈 Enable CORS for all routes

@app.route('/get-router', methods=['GET'])
def get_data():
    try:
        with open(r'D:\Extravis\CISCO Projects\Topology\network_topology_latest_backend\response.json', 'r', encoding='utf-8') as file:
            data = json.load(file)
        return jsonify(data), 200
    except FileNotFoundError:
        return jsonify({'error': 'response.json file not found'}), 404
    except json.JSONDecodeError:
        return jsonify({'error': 'Invalid JSON format'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/topInterfaceUtilization', methods=['GET'])
def get_top_interface_utilization():
    try:
        with open(r'D:\Extravis\CISCO Projects\Topology\network_topology_latest_backend\topinterfaceutilresponse.json', 'r', encoding='utf-8') as file:
            data = json.load(file)
        return jsonify(data), 200
    except FileNotFoundError:
        return jsonify({'error': 'TopInterfaceUtilization.json file not found'}), 404
    except json.JSONDecodeError:
        return jsonify({'error': 'Invalid JSON format'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True)