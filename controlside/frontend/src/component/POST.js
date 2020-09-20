export default function apicallpost(url,data){
    let lookupOptions = {
      method: "POST",
      headers:{
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data),
      credentials: 'include'
    }

    let realurl = url
    // let tests = url.split("..")
    // let realurl = "http://localhost:8080"+tests[1]

    return fetch(realurl, lookupOptions)
    .then(function(response){
      return response.json()
    }).then(responseData=>responseData)
}

