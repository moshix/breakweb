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
*/
package main

import (
    "encoding/json"
    "net/http"
    "path/filepath"
    "sync"
)

type Score struct {
    Player string `json:"player"`
    Score  int    `json:"score"`
}

var (
    scores = make(map[string]int)
    mu     sync.Mutex
)

func main() {
    http.HandleFunc("/", serveGame)
    http.HandleFunc("/update-score", updateScore)

    fs := http.FileServer(http.Dir("./static"))
    http.Handle("/static/", http.StripPrefix("/static/", fs))

    http.ListenAndServe(":8080", nil)
}

func serveGame(w http.ResponseWriter, r *http.Request) {
    http.ServeFile(w, r, filepath.Join("static", "index.html"))
}

func updateScore(w http.ResponseWriter, r *http.Request) {
    var score Score
    if err := json.NewDecoder(r.Body).Decode(&score); err != nil {
        http.Error(w, err.Error(), http.StatusBadRequest)
        return
    }

    mu.Lock()
    scores[score.Player] = score.Score
    mu.Unlock()

    w.WriteHeader(http.StatusOK)
}

