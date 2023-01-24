const ONE_HOUR = 60 * 60 * 1000;
const FIVE_MINUTES = 5 * 60 * 1000;

/**
 * Get the day of the week from a Date object
 * @param {Date} date
 * @returns {String}
 */
function getDayOfTheWeek(date) {
  const newDate = new Date(date);
  const day = newDate.getDay();
  switch (day) {
    case 0:
      return "sunday";
    case 1:
      return "monday";
    case 2:
      return "tuesday";
    case 3:
      return "wednesday";
    case 4:
      return "thursday";
    case 5:
      return "friday";
    case 6:
      return "saturday";
    default:
      return "Unknown";
  }
}

function getDateView(date) {
  const newDate = new Date(date);
  const day = newDate.getDate();
  const month = newDate.getMonth() + 1;
  const fullYear = newDate.getFullYear();
  const year = fullYear.toString().slice(-2);

  return `${day < 10 ? `0${day}` : day}.${
    month < 10 ? `0${month}` : month
  }.${year}`;
}

export { getDayOfTheWeek, getDateView, ONE_HOUR, FIVE_MINUTES };
