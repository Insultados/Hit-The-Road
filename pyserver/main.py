from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
from Astar import *
import redis

r = redis.StrictRedis(
    host='localhost', 
    port=6379, 
)

matrix = r.json().get('matrix')
vertices = r.json().get('vertices')

result = []


for i in range(39):
    for j in range(i, 39):
        if matrix[i][j] != 0:
            result.append([i, j])

d = {'vertices': vertices, 'list': result}

app = Flask(__name__)
CORS(app, support_credentials=True)


@app.route('/api/v1/', methods=['GET', 'OPTIONS'])
@cross_origin(supports_credentials=True)
def get():
    return jsonify(d)


@app.route('/api/v1/itinerary/', methods=['POST', 'OPTIONS'])
@cross_origin(supports_credentials=True)
def post():
    if request.method=='POST':
        some_json=request.json
        print(some_json)
        graph = Graph(matrix, vertices, some_json['A'], some_json['B'], some_json['list_mandatory'], some_json['list_avoided'])
        return jsonify(graph.get_result())

if __name__ == '__main__':
    app.run(debug=True, port=5000)
