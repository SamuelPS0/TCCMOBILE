import axios from "axios";

const globalapi = axios.create({
  baseURL: "http://10.0.2.2:8080/api/v1/",
});

//Links
//"http://10.0.2.2:8080/api/v1/categoria"
//"http://10.0.2.15:8080/api/v1/categoria"
//"http://localhost:8080/api/v1/categoria"

//COLOCAR NO EMULADOR
//10.0.2.2
//Port number: 45457

export { globalapi };

