
window.doa ?= {};
window.doa.i18n ?= {};
window.doa.i18n.en =
  translation:
    title: "doa"
    common:
      save: "Save"
    watch:
      namePlaceholder: "Something to watch"
      save: "Save"
      interval:
        hourly: "Hourly"
        daily: "Daily"
        weekly: "Weekly"
        monthly: "Monthly"
    lastPing: "Last ping received: __time__"
    pingInstructions: "Send a POST request to this URL to start watching."
    status:
      up: "Last seen %{time} ago"
      down: "Not seen for %{time}"
      new: "Waiting for ping"
    climate:
      nothing: "Nothing to do"
      allNew: "Nothing's happening"
      noneDown: "All is good!"
      someDown: "Smells dead"
      allDown: "It's dead Jim"
      downCount:
        more: "%{n} down"
      newCount:
        more: "%{n} waiting"
      upCount:
        more: "%{n} up"