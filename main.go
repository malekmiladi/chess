package main

import (
	"fmt"
	"net/http"
)

func main() {
	fmt.Println("Chess server started!")

	static := http.Dir("web/dist")

	http.Handle("/", http.FileServer(static))

	http.ListenAndServe("localhost:8000", nil)
}
