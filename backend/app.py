from flask import Flask, jsonify
from flask_cors import CORS
from prometheus_api_client import PrometheusConnect
from prometheus_api_client.utils import parse_datetime
import pandas as pd
from prophet import Prophet
import os

app = Flask(__name__)
CORS(app)

# Connect to Prometheus (running in your cluster via port-forward)
prom = PrometheusConnect(url=os.environ.get("PROMETHEUS_URL", "http://localhost:9090"), disable_ssl=True)

@app.route('/health')
def health():
    return jsonify({"status": "ok"})

@app.route('/predict/memory/<pod_name>')
def predict_memory(pod_name):
    query = f'container_memory_working_set_bytes{{pod="{pod_name}"}}'
    
    try:
        metric_data = prom.custom_query_range(
            query=query,
            start_time=parse_datetime("30m"),
            end_time=parse_datetime("now"),
            step="1m"
        )
        
        if not metric_data:
            return jsonify({"error": f"No data found for pod {pod_name}"}), 404
        
        values = metric_data[0]['values']
        df = pd.DataFrame(values, columns=['ds', 'y'])
        df['ds'] = pd.to_datetime(df['ds'], unit='s')
        df['y'] = pd.to_numeric(df['y'])
        
        m = Prophet()
        m.fit(df)
        
        future = m.make_future_dataframe(periods=30, freq='min')
        forecast = m.predict(future)
        
        prediction = forecast.tail(1)[['ds', 'yhat', 'yhat_lower', 'yhat_upper']].to_dict('records')[0]
        
        limit = 134217728
        percent_predicted = (prediction['yhat'] / limit) * 100
        
        return jsonify({
            "pod": pod_name,
            "current_memory_bytes": float(df['y'].iloc[-1]),
            "predicted_memory_bytes_30m": float(prediction['yhat']),
            "predicted_percent_of_limit": round(percent_predicted, 2),
            "risk_level": "HIGH" if percent_predicted > 90 else "MEDIUM" if percent_predicted > 70 else "LOW",
            "trend": "increasing" if prediction['yhat'] > df['y'].iloc[-1] else "stable"
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
