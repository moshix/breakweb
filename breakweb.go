/*
// Breakout game for enviroments with Go and javascript
// (c) 2024 by moshix
//
// initially created to have a fun game to play on powerful
//  IBM z mainframes running z/OS
//  ... but it really runs anywhere
// v 0.1 humble beginnings
// v 0.2 web server and html canvas
// v 0.3 game logic
// v 0.4 colors!
// v 0.5 restart, pause and resume
// v 0.6 score keeping
// v 0.7 logic refinements
// v 0.8 rip out Pause
// v 0.9 variable ball speed
// v 1.0 Pause/unpause and better logging in webserver
// v 1.1 Boss key
*/
package main

import (
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
)

func main() {
	// Get the current working directory
	cwd, err := os.Getwd()
	if err != nil {
		log.Fatalf("Error getting current working directory: %v", err)
	}

	// Define the paths for index.html and static directory
	indexFilePath := filepath.Join(cwd, "static", "index.html")
	staticDir := filepath.Join(cwd, "static")

	// Create a log file
	logFile, err := os.OpenFile("server.log", os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0666)
	if err != nil {
		log.Fatalf("Error opening log file: %v", err)
	}
	defer logFile.Close()

	// Set log output to both the file and standard output
	multiLog := log.New(io.MultiWriter(logFile, os.Stdout), "", log.LstdFlags)
	log.SetOutput(io.MultiWriter(logFile, os.Stdout))

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		ip := r.RemoteAddr
		multiLog.Printf("Incoming connection from %s", ip)

		if r.URL.Path == "/" {
			// Serve the index.html file
			if _, err := os.Stat(indexFilePath); os.IsNotExist(err) {
				http.Error(w, "404 page not found", http.StatusNotFound)
				multiLog.Printf("Error: %v", err)
				return
			}
			http.ServeFile(w, r, indexFilePath)
		} else {
			http.Error(w, "404 page not found", http.StatusNotFound)
		}
	})

	// Serve static files from the "static" directory
	http.Handle("/static/", http.StripPrefix("/static/", http.FileServer(http.Dir(staticDir))))

	http.HandleFunc("/update-score", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != "POST" {
			http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
			return
		}

		// Log incoming score updates
		multiLog.Printf("Score update request from %s", r.RemoteAddr)

		// Read the request body
		body, err := io.ReadAll(r.Body)
		if err != nil {
			http.Error(w, "Error reading request body", http.StatusInternalServerError)
			multiLog.Printf("Error reading request body: %v", err)
			return
		}
		multiLog.Printf("Score update body: %s", string(body))

		w.WriteHeader(http.StatusOK)
	})

	port := 8080
	addr := fmt.Sprintf(":%d", port)
	multiLog.Printf("Starting server on port %d", port)

	err = http.ListenAndServe(addr, nil)
	if err != nil {
		multiLog.Fatalf("Server failed to start: %v", err)
	}
}

