const FURNISHINGS =
{
  "title": "Faithlife Room Layout Furniture Library",
  "rooms": [
    {
      "title": "13' x 17' Small Conference Room",
      "width": 156,
      "height": 204
    },
    {
      "title": "15' x 26' Medium Conference Room",
      "width": 180,
      "height": 312
    },
    {
      "title": "18' x 21' Medium Conference Room",
      "width": 216,
      "height": 252
    },
    {
      "title": "20' x 10'",
      "width": 240,
      "height": 120
    },
    {
      "title": "16' x 12'",
      "width": 192,
      "height": 144
    },
    {
      "title": "Gym (Regulation)",
      "width": 1320,
      "height": 720
    },
    {
      "title": "Gym (High School)",
      "width": 1008,
      "height": 600
    },
    {
      "title": "40' x 20'",
      "width": 480,
      "height": 240
    }
  ],
  "tables": [
    {
      "title": "54\" Round Folding",
      "width": 54,
      "height": 54,
      "lrSpacing": 54,
      "tbSpacing": 54,
      "shape": "circle",
      "chairs": 6
    },
    {
      "title": "60\" Round Folding",
      "width": 60,
      "height": 60,
      "lrSpacing": 60,
      "tbSpacing": 60,
      "shape": "circle",
      "chairs": 8
    },
    {
      "title": "72\" Round Folding",
      "width": 72,
      "height": 72,
      "lrSpacing": 72,
      "tbSpacing": 72,
      "shape": "circle",
      "chairs": 8
    },
    {
      "title": "6' x 30\" Folding",
      "width": 72,
      "height": 30,
      "lrSpacing": 24,
      "tbSpacing": 60,
      "shape": "rect",
      "topChairs": 3,
      "bottomChairs": 3,
      "leftChairs": 0,
      "rightChairs": 0
    },
    {
      "title": "8' x 30\" Folding",
      "width": 96,
      "height": 30,
      "lrSpacing": 24,
      "tbSpacing": 60,
      "shape": "rect",
      "topChairs": 4,
      "bottomChairs": 4,
      "leftChairs": 0,
      "rightChairs": 0
    },
    {
      "title": "8' x 40\" Family",
      "width": 96,
      "height": 40,
      "lrSpacing": 60,
      "tbSpacing": 60,
      "shape": "rect",
      "topChairs": 4,
      "bottomChairs": 3,
      "leftChairs": 1,
      "rightChairs": 1
    },
    {
      "title": "8' x 18\" Classroom",
      "width": 96,
      "height": 18,
      "lrSpacing": 24,
      "tbSpacing": 36,
      "shape": "rect",
      "topChairs": 0,
      "bottomChairs": 4,
      "leftChairs": 0,
      "rightChairs": 0
    },
    {
      "title": "6' x 18\" Classroom",
      "width": 72,
      "height": 18,
      "lrSpacing": 24,
      "tbSpacing": 36,
      "shape": "rect",
      "topChairs": 0,
      "bottomChairs": 3,
      "leftChairs": 0,
      "rightChairs": 0
    }
  ],
  "chairs": [
    {
      "title": "Generic",
      "width": 18,
      "height": 20,
      "lrSpacing": 2,
      "tbSpacing": 12,
      "parts": [
        { "type": "rect", "definition": { left: 0, top: 0, width: 18, height: 20 } },
        { "type": "rect", "definition": { left: 0, top: 18, width: 18, height: 2 } }
      ]
    },
    {
      "title": "14\" Children's",
      "width": 14,
      "height": 14,
      "lrSpacing": 2,
      "tbSpacing": 12,
      "parts": [
        { "type": "circle", "definition": { originX: "center", originY: "center", radius: 7 } },
        { "type": "circle", "definition": { originX: "center", originY: "center", radius: 4 } }
      ]
    },
    {
      "title": "18\" Folding",
      "width": 18,
      "height": 18,
      "lrSpacing": 2,
      "tbSpacing": 12,
      "parts": [
        { "type": "rect", "definition": { left: 0, top: 0, width: 18, height: 18 } },
        { "type": "rect", "definition": { left: 0, top: 16, width: 18, height: 2 } }
      ]
    },
    {
      "title": "18\" Stacking",
      "width": 18.375,
      "height": 23.25,
      "lrSpacing": 2,
      "tbSpacing": 12.75,
      "parts": [
        { "type": "rect", "definition": { width: 18.375, height: 23.25 } },
        { "type": "rect", "definition": { width: 18.375, height: 4, top: 19.25 } },
        { "type": "rect", "definition": { width: 18.375, height: 2, top: 21.25 } }
      ]
    },
    {
      "title": "20\" Pew Stacker",
      "source": "http://sanctuaryseating.com/church-chairs/impressions-series/model-7027/",
      "width": 20.25,
      "height": 26.3,
      "lrSpacing": 1,
      "tbSpacing": 12,
      "parts": [
        { "type": "rect", "definition": { width: 20.25, height: 26.3 } },
        { "type": "rect", "definition": { width: 20.25, height: 8, top: 18.3 } },
        { "type": "rect", "definition": { width: 20.25, height: 6, top: 20.3 } }
      ]
    },
    {
      "title": "22\" Pew Stacker",
      "source": "http://sanctuaryseating.com/church-chairs/impressions-series/model-7227/",
      "width": 22,
      "height": 26.3,
      "lrSpacing": 1,
      "tbSpacing": 12,
      "parts": [
        { "type": "rect", "definition": { width: 22, height: 26.3 } },
        { "type": "rect", "definition": { width: 22, height: 8, top: 18.3 } },
        { "type": "rect", "definition": { width: 22, height: 6, top: 20.3 } }
      ]
    },
    {
      "title": "22\" Square",
      "width": 22,
      "height": 22,
      "lrSpacing": 2,
      "tbSpacing": 12,
      "parts": [
        { "type": "rect", "definition": { width: 22, height: 22 } },
        { "type": "rect", "definition": { width: 22, height: 6, top: 16 } }
      ]
    }
  ],
  "miscellaneous": [
    {
      "title": "Rectangle",
      "width": 36,
      "height": 12,
      "flexible": true,
      "parts": [
        { "type": "rect", "definition": { left: 0, top: 0, width: 36, height: 12 } }
      ]
    },
    {
      "title": "5' x 23\" Upright Piano",
      "width": 60,
      "height": 23,
      "parts": [
        { "type": "rect", "definition": { left: 15, top: 16, width: 30, height: 14, stroke: "chair" } },  // bench
        { "type": "rect", "definition": { left: 0, top: 0, width: 60, height: 23 } }, // base
        { "type": "rect", "definition": { left: 0, top: 0, width: 6, height: 23 } },    // side pillar
        { "type": "rect", "definition": { left: 54, top: 0, width: 6, height: 23 } }, // side pillar
        { "type": "rect", "definition": { left: 0, top: 0, width: 60, height: 13 } }  // top
      ]
    },
    {
      "title": "6' Grand Piano",
      "width": 58,
      "height": 84,
      "parts": [
        { "type": "rect", "definition": { left: 11, top: 77, width: 36, height: 14, stroke: "chair" } },  // bench
        { "type": "path", "path": "M 0,84 L 0,36 C 0,2 42,2 42,32 S 58,50 58,72 L 58,84 z", "definition": {} }, // outline
        { "type": "rect", "definition": { left: 0, top: 74, width: 58, height: 10 } },  // keyboard area
        { "type": "rect", "definition": { left: 0, top: 74, width: 6, height: 10 } },   // side pillar
        { "type": "rect", "definition": { left: 52, top: 74, width: 6, height: 10 } }   // side pillar
      ]
    },
    {
      "title": "7' Grand Piano",
      "width": 62,
      "height": 84,
      "parts": [
        // { "type": "rect", "definition": { left: 13, top: 77, width: 36, height: 14, stroke: "chair" } },  // bench
        { "type": "path", "path": "M 0,84 L 0,24 C 0,-10 46,-10 46,26 S 62,50 62,72 L 62,84 z", "definition": {} }, // outline
        { "type": "rect", "definition": { left: 0, top: 74, width: 62, height: 10 } },  // keyboard area
        // { "type": "rect", "definition": { left: 0, top: 74, width: 6, height: 10 } },   // side pillar
        // { "type": "rect", "definition": { left: 56, top: 74, width: 6, height: 10 } }   // side pillar
      ]
    },
    {
      "title": "8' Grand Piano",
      "width": 62,
      "height": 94,
      "parts": [
        { "type": "rect", "definition": { left: 13, top: 87, width: 36, height: 14, stroke: "chair" } },  // bench
        { "type": "path", "path": "M 0,94 L 0,24 C 0,-10 46,-10 46,28 S 62,62 62,78 L 62,94 z", "definition": {} }, // outline
        { "type": "rect", "definition": { left: 0, top: 84, width: 62, height: 10 } },  // keyboard area
        { "type": "rect", "definition": { left: 0, top: 84, width: 6, height: 10 } },   // side pillar
        { "type": "rect", "definition": { left: 56, top: 84, width: 6, height: 10 } }   // side pillar
      ]
    },
    {
      "title": "Awana Game Square",   // note: calculation from Excel spreadsheet
      "width": 200,
      "height": 200,
      "parts": [
        { "type": "circle", "definition": { left: 240, top: 240, strokeWidth: 2, stroke: "#aaaaaa", originX: "center", originY: "center", radius: 180 } },  // game circle

        // blue
        { "type": "path", "path": "M329.8,82.32L340.41,71.71", "definition": { strokeWidth: 2, stroke: "#aaaaaa" } },  // circle starting line
        { "type": "path", "path": "M480,0L480,480M480,0L240,240M299.4,180.6L299.4,299.4M278.19,193.33L286.67,201.81M273.94,138.18L341.82,206.06M312.13,159.39L320.61,167.87M320.61,150.91L329.09,159.39M329.1,142.42L337.58,150.9M337.58,133.94L346.06,142.42M346.07,125.45L354.55,133.93", "definition": { stroke: "blue", strokeWidth: 2 } },

        // green
        { "type": "path", "path": "M408.29,340.41L397.68,329.8", "definition": { strokeWidth: 2, stroke: "#aaaaaa" } },  // circle starting line
        { "type": "path", "path": "M0,480L480,480M240,240L480,480M180.6,299.4L299.4,299.4M278.19,286.67L286.67,278.19M273.94,341.82L341.82,273.94M312.13,320.61L320.61,312.13M320.61,329.09L329.09,320.61M329.1,337.58L337.58,329.1M337.58,346.06L346.06,337.58M346.07,354.55L354.55,346.07", "definition": { stroke: "green", strokeWidth: 2 } },

        // yellow
        { "type": "path", "path": "M150.2,397.68L139.59,408.29", "definition": { strokeWidth: 2, stroke: "#aaaaaa" } },  // circle starting line
        { "type": "path", "path": "M0,480L0,0M0,480L240,240M180.6,299.4L180.6,180.6M201.81,286.67L193.33,278.19M206.06,341.82L138.18,273.94M167.87,320.61L159.39,312.13M159.39,329.09L150.91,320.61M150.9,337.58L142.42,329.1M142.42,346.06L133.94,337.58M133.93,354.55L125.45,346.07", "definition": { stroke: "yellow", strokeWidth: 2 } },

        // draw red last because it's stronger and on top, and it'll capture corners this way
        // red
        { "type": "path", "path": "M82.32,150.2L71.71,139.59", "definition": { strokeWidth: 2, stroke: "#aaaaaa" } },  // circle starting line
        { "type": "path", "path": "M0,0L480,0M0,0L240,240M180.6,180.6L299.4,180.6M193.33,201.81L201.81,193.33M138.18,206.06L206.06,138.18M159.39,167.87L167.87,159.39M150.91,159.39L159.39,150.91M142.42,150.9L150.9,142.42M133.94,142.42L142.42,133.94M125.45,133.93L133.93,125.45", "definition": { stroke: "red", strokeWidth: 2 } }

        //{ "type": "line", "line": [ 0,0,100,0 ], "definition": { stroke: "#ffff00", strokeWidth: "2" } },
        //{ "type": "line", "line": [ 0,0,100,100 ], "definition": { stroke: "#00ffff", strokeWidth: "2" } }
      ]
    }
  ],
  doors: [
    {
      title: 'Narrow Door (28" wide)',
      parts: [
        { type: 'rect', definition: { left: 0, width: 28, top: -2, height: 4, fill: 'white', strokeWidth: 0, originX: 'left', originY: 'top' } },
        { type: 'line', line: [0, -2, 0, 30], definition: { stroke: 'black', strokeWidth: 1 } },
        { type: 'path', path: 'M 0 30 Q 28, 30, 28, 2', definition: { stroke: '#999', strokeWidth: 1, fill: 'transparent' } },
      ]
    }, {
      title: 'Normal Door (32" wide)',
      parts: [
        { type: 'rect', definition: { left: 0, width: 32, top: -2, height: 4, fill: 'white', strokeWidth: 0, originX: 'left', originY: 'top' } },
        { type: 'line', line: [0, -2, 0, 34], definition: { stroke: 'black', strokeWidth: 1 } },
        { type: 'path', path: 'M 0 34 Q 32, 34, 32, 2', definition: { stroke: '#999', strokeWidth: 1, fill: 'transparent' } },
      ]
    }, {
      title: 'Wide Door (36" wide)',
      parts: [
        { type: 'rect', definition: { left: 0, width: 36, top: -2, height: 4, fill: 'white', strokeWidth: 0, originX: 'left', originY: 'top' } },
        { type: 'line', line: [0, -2, 0, 38], definition: { stroke: 'black', strokeWidth: 1 } },
        { type: 'path', path: 'M 0 38 Q 36, 38, 36, 2', definition: { stroke: '#999', strokeWidth: 1, fill: 'transparent' } },
      ]
    }, {
      title: 'Double Doors (64" wide)',
      parts: [
        { type: 'rect', definition: { left: 0, width: 64, top: -2, height: 4, fill: 'white', strokeWidth: 0, originX: 'left', originY: 'top' } },
        { type: 'line', line: [0, -2, 0, 34], definition: { stroke: 'black', strokeWidth: 1 } },
        { type: 'path', path: 'M 0 34 Q 32, 34, 32, 2', definition: { stroke: '#999', strokeWidth: 1, fill: 'transparent' } },
        { type: 'line', line: [64, -2, 64, 34], definition: { stroke: 'black', strokeWidth: 1 } },
        { type: 'path', path: 'M 32 2 Q 32, 34, 64, 34', definition: { stroke: '#999', strokeWidth: 1, fill: 'transparent' } },
      ]
    }
  ],
  windows: [
    {
      title: '2’ Window (24” wide)',
      parts: [
        { type: 'rect', definition: { left: 0, width: 24, top: 0, height: 3, fill: 'white', strokeWidth: 1, originX: 'left', originY: 'top' } },
      ]
    },
    {
      title: '3’ Window (36” wide)',
      parts: [
        { type: 'rect', definition: { left: 0, width: 36, top: 0, height: 3, fill: 'white', strokeWidth: 1, originX: 'left', originY: 'top' } },
      ]
    },
    {
      title: '4’ Window (48” wide)',
      parts: [
        { type: 'rect', definition: { left: 0, width: 48, top: 0, height: 3, fill: 'white', strokeWidth: 1, originX: 'left', originY: 'top' } },
      ]
    },
    {
      title: '6’ Window (72” wide)',
      parts: [
        { type: 'rect', definition: { left: 0, width: 72, top: 0, height: 3, fill: 'white', strokeWidth: 1, originX: 'left', originY: 'top' } },
      ]
    }
  ]
};

export { FURNISHINGS }
