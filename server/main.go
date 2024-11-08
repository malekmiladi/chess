package main

import (
    "log"
	"net/http"
)

func main() {
    fs := http.FileServer(http.Dir("./web/dist"))
	http.Handle("/", fs)

	log.Print("Chess Server started")
	log.Print("Listening on port 8000...")

	err := http.ListenAndServe("localhost:8000", nil)
	if err != nil {
	    log.Fatal(err)
	}
}
