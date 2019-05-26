function msToTime(duration) {
  var seconds = duration / 1000;
  var minutes = seconds / 60;
  var hours = minutes / 60;
  var days = hours / 24;

  if (days > 1) {
    return round(days, 1).toString() + 'd';
  }

  if (hours > 1) {
    return round(hours, 1).toString() + 'h';
  }

  if (minutes > 1) {
    return round(minutes, 1).toString() + 'm';
  }

  return round(seconds, 1).toString() + 's';
}

function round(num, decimals) {
  var roundedValue = Math.round(num * 10 ** decimals) / (10 ** decimals)
  return roundedValue
}

module.exports = {
  msToTime: msToTime,
  round: round
}