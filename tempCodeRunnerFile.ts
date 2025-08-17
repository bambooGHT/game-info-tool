import axios from "axios";

axios.get('https://2dfan.com/', {
  "headers": {
    "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
    "accept-language": "zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7,ja;q=0.6,zh-CN;q=0.5",
    "cache-control": "max-age=0",
    "priority": "u=0, i",
    "sec-ch-ua": "\"Not;A=Brand\";v=\"99\", \"Google Chrome\";v=\"139\", \"Chromium\";v=\"139\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"Windows\"",
    "sec-fetch-dest": "document",
    "sec-fetch-mode": "navigate",
    "sec-fetch-site": "none",
    "sec-fetch-user": "?1",
    "upgrade-insecure-requests": "1",
    "cookie": "remember_me_token=eyJfcmFpbHMiOnsibWVzc2FnZSI6IkltRnphWGh0VEc0eGVrcGZkVlZwWVhOaVpGTjZJZz09IiwiZXhwIjoiMjAyNS0xMC0xNVQxNToyMzo1OC4zNzNaIiwicHVyIjoiY29va2llLnJlbWVtYmVyX21lX3Rva2VuIn19--98647ba7f21915a7dd57ccc387504a4c2b221213; _project_hgc_session=V4pFneMyaJnjm2WYvd4mPqM%2B8IBZQJdhwZwdsy5k7u%2BFLmxhjMhd21rvkhnr5eNI%2FAtCpS08xHfhHKMaSjRcpHhEOfV1nG4sEPM6UO9BT4cI19%2BLRLyPDdNCM8TeNa7xd0Qy9CtSa%2Fa7%2BvckUmJ6hISs%2Fv0jsp8fjEuRWiUAoF0cZAKTfkph8iJIy4zXr61QoQTzljdE%2FkinbghjHQ8mS2kHXVUwgZlg%2Bdvz0pAqTUAuWy6K5L1MgVHl3lKai4qQifu7zkxpo2TSWmsxXIAf3a0MGOir71wF07Az9WAvq9F4RPIfbPWuYPOtcWl0NqiG8vFftA%3D%3D--L8TvUwp2Rsy%2B4AH8--sANpHdzPOqR2UIEbBnKGjQ%3D%3D; cf_clearance=mzi8ih1oSKywzLSXaC8XjTwcQLq6cnp9fuXvX2nKGgc-1755365993-1.2.1.1-.R78Vkzn2kD7HLHQumWha4uDCM029uwmPcGV4CnifYtBeCeWwmLy8Q5GRW5OX2V_H43X7Wkn0NFdzgwygK0GOqXWDDSEPeAaKW3mO9Xg6GWpHkMOQpGqvNorJDMQJGoUSJI3DZZkv2ctxOAWeuNUlrgU9gDh02k9IbNcNDh7uTHsBEPlHv2VJl6uwhaZTVqdGHwhjFyVwgg08n7_IrwGRbHeGioxHHr4Qy0V8YZfIBY"
  },
}).then(res => {
  console.log(res.data);
});

// const fn = async () => {
//   const data = await fetch("https://2dfan.com/", {
//     "headers": {
//       "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
//       "accept-language": "zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7,ja;q=0.6,zh-CN;q=0.5",
//       "cache-control": "max-age=0",
//       "priority": "u=0, i",
//       "sec-ch-ua": "\"Not;A=Brand\";v=\"99\", \"Google Chrome\";v=\"139\", \"Chromium\";v=\"139\"",
//       "sec-ch-ua-mobile": "?0",
//       "sec-ch-ua-platform": "\"Windows\"",
//       "sec-fetch-dest": "document",
//       "sec-fetch-mode": "navigate",
//       "sec-fetch-site": "none",
//       "sec-fetch-user": "?1",
//       "upgrade-insecure-requests": "1",
//       "cookie": "remember_me_token=eyJfcmFpbHMiOnsibWVzc2FnZSI6IkltRnphWGh0VEc0eGVrcGZkVlZwWVhOaVpGTjZJZz09IiwiZXhwIjoiMjAyNS0xMC0xNVQxNToyMzo1OC4zNzNaIiwicHVyIjoiY29va2llLnJlbWVtYmVyX21lX3Rva2VuIn19--98647ba7f21915a7dd57ccc387504a4c2b221213; _project_hgc_session=V4pFneMyaJnjm2WYvd4mPqM%2B8IBZQJdhwZwdsy5k7u%2BFLmxhjMhd21rvkhnr5eNI%2FAtCpS08xHfhHKMaSjRcpHhEOfV1nG4sEPM6UO9BT4cI19%2BLRLyPDdNCM8TeNa7xd0Qy9CtSa%2Fa7%2BvckUmJ6hISs%2Fv0jsp8fjEuRWiUAoF0cZAKTfkph8iJIy4zXr61QoQTzljdE%2FkinbghjHQ8mS2kHXVUwgZlg%2Bdvz0pAqTUAuWy6K5L1MgVHl3lKai4qQifu7zkxpo2TSWmsxXIAf3a0MGOir71wF07Az9WAvq9F4RPIfbPWuYPOtcWl0NqiG8vFftA%3D%3D--L8TvUwp2Rsy%2B4AH8--sANpHdzPOqR2UIEbBnKGjQ%3D%3D; cf_clearance=mzi8ih1oSKywzLSXaC8XjTwcQLq6cnp9fuXvX2nKGgc-1755365993-1.2.1.1-.R78Vkzn2kD7HLHQumWha4uDCM029uwmPcGV4CnifYtBeCeWwmLy8Q5GRW5OX2V_H43X7Wkn0NFdzgwygK0GOqXWDDSEPeAaKW3mO9Xg6GWpHkMOQpGqvNorJDMQJGoUSJI3DZZkv2ctxOAWeuNUlrgU9gDh02k9IbNcNDh7uTHsBEPlHv2VJl6uwhaZTVqdGHwhjFyVwgg08n7_IrwGRbHeGioxHHr4Qy0V8YZfIBY"
//     },
//     "body": null,
//     "method": "GET"
//   });
//   const data1 = await data.text();
//   console.log(111);
//   console.log(data1);
// };
// fn();