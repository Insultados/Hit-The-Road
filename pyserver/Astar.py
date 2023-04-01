from math import ceil
import copy
import heapq


class PriorityQueue:
    def __init__(self):
        self.elements: list[tuple[float, int]] = []

    def empty(self) -> bool:
        return not self.elements

    def put(self, item: int, priority: float):
        heapq.heappush(self.elements, (priority, item))

    def get(self) -> int:
        return heapq.heappop(self.elements)[1]

class Graph:
    def __init__(self, matrix, vertices, start, goal, required_vertices=None, avoided_vertices=None):
        self.matrix = copy.deepcopy(matrix)
        self.vertices = copy.deepcopy(vertices)
        self.start = start
        self.goal = goal
        self.number_of_vertices = len(self.vertices)
        self.required_vertices = required_vertices
        self.avoided_vertices = avoided_vertices
        if avoided_vertices is not None:
            for vertex in self.avoided_vertices:
                self.vertices[vertex]["priority"] = 0.001
                # for i in range(self.number_of_vertices):
                    # if self.matrix[vertex][i] != 0:
                    #     self.matrix[vertex][i] = 10000
                    # if self.matrix[i][vertex] != 0:
                    #     self.matrix[i][vertex] = 10000
                    
    def get_result(self):
        if self.required_vertices is None:
            result = self.apply_A_star_algorithm(self.start, self.goal)
            result.reverse()

            # for i in result:
            #     print(self.vertices[i]["name"])
            distance = 0
            for i in range(len(result) - 1):
                distance += self.matrix[result[i]][result[i+1]]
            # print(distance, 'km')
            # print(self.vertices)
            return result + [distance]
        else:
            result = []
            sorted_required_vertices = self.sort_vertices()
            for i in range(len(sorted_required_vertices) - 1):
                tmp = self.apply_A_star_algorithm(sorted_required_vertices[i], sorted_required_vertices[i + 1])
                tmp.reverse()
                result += tmp[1:]
                for city in tmp:
                    self.vertices[city]["priority"] = 0.001
            # for i in result:
            #     print(self.vertices[i]["name"])
            result = [self.start] + result
            distance = 0
            for i in range(len(result) - 1):
                distance += self.matrix[result[i]][result[i+1]]
            # print(distance, 'km')
            # print(self.vertices)
            return result + [distance]

    def sort_vertices(self):
        tmp_array = []
        tmp_dict = {}
        for vertex in self.required_vertices:
            tmp_distance = self.heuristic(vertex, self.goal) # + self.heuristic(vertex, self.start)
            tmp_dict[tmp_distance] = vertex
            tmp_array.append(tmp_distance)
        tmp_array.sort(reverse=True)
        result = []
        for i in tmp_array:
            result.append(tmp_dict[i])
        result.append(self.goal)
        result.insert(0, self.start)
        # print(result)
        return result

    def neighbors(self, current_vertex):
        result = []
        for i in range(self.number_of_vertices):
            # print(current_vertex, self.matrix[current_vertex])
            if self.matrix[current_vertex][i] != 0:
                result.append(i)
        return result

    def cost(self, current, next):
        # road_length = self.matrix[current][next] * (self.vertices[next]["priority"] // 3 + 1)
        road_length = self.matrix[current][next]
        city_value = self.vertices[next]["priority"]
        if city_value > 3 and city_value != int(city_value):
            self.vertices[next]["priority"] = ceil(city_value)
            city_value = 0.1
        cost = road_length / 100 * (road_length + road_length/city_value)
        return cost

    def heuristic(self, goal, next):
        return 100*(((self.vertices[goal]["coordinates"][0] - self.vertices[next]["coordinates"][0])**2\
                     + (self.vertices[goal]["coordinates"][1] - self.vertices[next]["coordinates"][1])**2)**(0.5))


    def apply_A_star_algorithm(self, start, finish):
        frontier = PriorityQueue()
        frontier.put(start, 0)
        came_from = dict()
        cost_so_far = dict()
        came_from[start] = None
        cost_so_far[start] = 0
        result = []

        while not frontier.empty():
            current = frontier.get()

            if current == finish:
                break

            neighbors = self.neighbors(current)
            for next in neighbors:
                new_cost = cost_so_far[current] + self.cost(current, next)
                if next not in cost_so_far or new_cost < cost_so_far[next]:
                    cost_so_far[next] = new_cost
                    priority = new_cost + self.heuristic(finish, next)
                    frontier.put(next, priority)
                    came_from[next] = current



        i = finish
        result.append(i)
        while i != start:
            i = came_from[i]
            result.append(i)
        return result


        # print(self.vertices[self.goal]["name"])
        # i = came_from[self.goal]
        # print(self.vertices[i]["name"])
        # while i != self.start:
        #     print(self.vertices[came_from[i]]["name"])
        #     i = came_from[i]


        # print(came_from)
        # print(self.neighbors(5))
