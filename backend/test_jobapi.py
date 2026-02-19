import http.client

conn = http.client.HTTPSConnection("jsearch.p.rapidapi.com")

headers = {
    'x-rapidapi-key': "",
    'x-rapidapi-host': "jsearch.p.rapidapi.com"
}

conn.request("GET", "/search?query=developer%20jobs%20in%20chicago&page=1&num_pages=1&country=us&date_posted=all", headers=headers)

res = conn.getresponse()
data = res.read()

print(data.decode("utf-8"))
