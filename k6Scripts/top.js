import http from "k6/http";

const BASE_URL = "http://192.168.3.144:80";

export default function () {
    http.get(`${BASE_URL}/`);
}