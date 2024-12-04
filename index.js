const http = require("http");
const fs = require("fs");
const requests = require("requests");
const url = require("url");

const data = fs.readFileSync("home.html", "utf-8");

const replaceVal = (tempval, orgval) => {
  let temp = tempval.replace("{%temprature%}", (orgval.main.temp - 273.15).toFixed(2));
  temp = temp.replace("{%mintemp%}", (orgval.main.temp_min - 273.15).toFixed(2));
  temp = temp.replace("{%maxtemp%}", (orgval.main.temp_max - 273.15).toFixed(2));
  temp = temp.replace("{%location%}", orgval.name);
  temp = temp.replace("{%country%}", orgval.sys.country);
  temp = temp.replace("{%tempstatus%}", orgval.weather[0].main);
  return temp;
};

const server = http.createServer((req, res) => {
  const query = url.parse(req.url, true).query;
  const city = query.city || "Delhi"; 
  
  if (req.url.startsWith("/weather")) {
    requests(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=4638b6b2693e27f748d02d3b0ea5617e`
    )
      .on("data", (chunk) => {
        const objdata = JSON.parse(chunk);
        const ArrData = [objdata];

        const realTimeData = ArrData.map((val) => replaceVal(data, val)).join("");
        res.write(realTimeData);
      })
      .on("end", (err) => {
        if (err) return console.log("connection closed due to errors", err);
        res.end();
      });
  } else {
    res.end("Welcome to the weather server! Use /weather?city=CityName for weather details.");
  }
});

server.listen(8000, "127.0.0.1", () => {
  console.log("Server is running on http://127.0.0.1:8000");
});
