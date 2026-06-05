var simplemaps_countrymap_mapdata = {
  main_settings: {
    //General settings
    width: "responsive", //'700' or 'responsive'
    background_color: "#FFFFFF",
    background_transparent: "yes",
    border_color: "#ffffff",

    //State defaults
    state_description: "State description",
    state_color: "#88A4BC",
    state_hover_color: "#3B729F",
    state_url: "",
    border_size: 1.5,
    all_states_inactive: "no",
    all_states_zoomable: "yes",

    //Location defaults
    location_description: "Location description",
    location_url: "",
    location_color: "#FF0067",
    location_opacity: 0.8,
    location_hover_opacity: 1,
    location_size: 25,
    location_type: "square",
    location_image_source: "frog.png",
    location_border_color: "#FFFFFF",
    location_border: 2,
    location_hover_border: 2.5,
    all_locations_inactive: "no",
    all_locations_hidden: "no",

    //Label defaults
    label_color: "#ffffff",
    label_hover_color: "#ffffff",
    label_size: 16,
    label_font: "Arial",
    label_display: "auto",
    label_scale: "yes",
    hide_labels: "no",
    hide_eastern_labels: "no",

    //Zoom settings
    zoom: "yes",
    manual_zoom: "yes",
    back_image: "no",
    initial_back: "no",
    initial_zoom: "-1",
    initial_zoom_solo: "no",
    region_opacity: 1,
    region_hover_opacity: 0.6,
    zoom_out_incrementally: "yes",
    zoom_percentage: 0.99,
    zoom_time: 0.5,

    //Popup settings
    popup_color: "white",
    popup_opacity: 0.9,
    popup_shadow: 1,
    popup_corners: 5,
    popup_font: "12px/1.5 Verdana, Arial, Helvetica, sans-serif",
    popup_nocss: "no",

    //Advanced settings
    div: "map",
    auto_load: "yes",
    url_new_tab: "no",
    images_directory: "default",
    fade_time: 0.1,
    link_text: "View Website",
    popups: "detect",
    state_image_url: "",
    state_image_position: "",
    location_image_url: ""
  },
  state_specific: {
    LK11: {
      name: "Colombo"
    },
    LK12: {
      name: "Gampaha"
    },
    LK13: {
      name: "Kalutara"
    },
    LK21: {
      name: "Kandy"
    },
    LK22: {
      name: "Matale"
    },
    LK23: {
      name: "Nuwara Eliya"
    },
    LK31: {
      name: "Galle"
    },
    LK32: {
      name: "Matara"
    },
    LK33: {
      name: "Hambantota"
    },
    LK41: {
      name: "Jaffna"
    },
    LK42: {
      name: "Kilinichchi"
    },
    LK43: {
      name: "Mannar"
    },
    LK44: {
      name: "Vavuniya"
    },
    LK45: {
      name: "Mulativu"
    },
    LK51: {
      name: "Batticaloa"
    },
    LK52: {
      name: "Ampara"
    },
    LK53: {
      name: "Trincomalee"
    },
    LK61: {
      name: "Kurunegala"
    },
    LK62: {
      name: "Puttalam"
    },
    LK71: {
      name: "Anuradhapura"
    },
    LK72: {
      name: "Polonnaruwa"
    },
    LK81: {
      name: "Badulla"
    },
    LK82: {
      name: "Moneragala"
    },
    LK91: {
      name: "Ratnapura"
    },
    LK92: {
      name: "Kegalle"
    }
  },
  locations: {
    "0": {
      name: "Colombo",
      lat: "6.931944",
      lng: "79.847778"
    }
  },
  labels: {
    LK11: {
      name: "Colombo",
      parent_id: "LK11"
    },
    LK12: {
      name: "Gampaha",
      parent_id: "LK12"
    },
    LK13: {
      name: "Kalutara",
      parent_id: "LK13"
    },
    LK21: {
      name: "Kandy",
      parent_id: "LK21"
    },
    LK22: {
      name: "Matale",
      parent_id: "LK22"
    },
    LK23: {
      name: "Nuwara Eliya",
      parent_id: "LK23"
    },
    LK31: {
      name: "Galle",
      parent_id: "LK31"
    },
    LK32: {
      name: "Matara",
      parent_id: "LK32"
    },
    LK33: {
      name: "Hambantota",
      parent_id: "LK33"
    },
    LK41: {
      name: "Jaffna",
      parent_id: "LK41"
    },
    LK42: {
      name: "Kilinochchi",
      parent_id: "LK42"
    },
    LK43: {
      name: "Mannar",
      parent_id: "LK43"
    },
    LK44: {
      name: "Vavuniya",
      parent_id: "LK44"
    },
    LK45: {
      name: "Mullaitivu",
      parent_id: "LK45"
    },
    LK51: {
      name: "Batticaloa",
      parent_id: "LK51"
    },
    LK52: {
      name: "Ampara",
      parent_id: "LK52"
    },
    LK53: {
      name: "Trincomalee",
      parent_id: "LK53"
    },
    LK61: {
      name: "Kurunegala",
      parent_id: "LK61"
    },
    LK62: {
      name: "Puttalam",
      parent_id: "LK62"
    },
    LK71: {
      name: "Anuradhapura",
      parent_id: "LK71"
    },
    LK72: {
      name: "Polonnaruwa",
      parent_id: "LK72"
    },
    LK81: {
      name: "Badulla",
      parent_id: "LK81"
    },
    LK82: {
      name: "Moneragala",
      parent_id: "LK82"
    },
    LK91: {
      name: "Ratnapura",
      parent_id: "LK91"
    },
    LK92: {
      name: "Kegalle",
      parent_id: "LK92"
    }
  },
  legend: {
    entries: []
  },
  regions: {}
};