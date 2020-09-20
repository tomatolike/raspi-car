export default function apicallget(url){
    let lookupOptions = {
        method: "GET",
        headers: {
          'Content-Type': 'application/json'
        }
      }

      let realurl = url

      // let lookupOptions = {
      //   method: "GET"
      // }
      
      // let tests = url.split("..")
      // let realurl = "http://localhost:8080"+tests[1]
  
      return fetch(realurl, lookupOptions)
      .then(function(response){
        return response.json()
      }).then(responseData=>responseData)
}

