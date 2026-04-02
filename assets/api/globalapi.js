import axios from "axios";

const globalapi = axios.create({
  baseURL: "http://10.0.2.2:8080/api/v1/",
});

//Links
//"http://10.0.2.2:8080/api/v1/"
//"http://10.0.2.15:8080/api/v1/"
//"http://localhost:8080/api/v1/"
//"http://192.168.3.7:8080/api/v1/"

export { globalapi };

