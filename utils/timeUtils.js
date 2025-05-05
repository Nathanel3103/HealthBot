function normalizeTime(timeRange) {
    return timeRange
      .split(' - ')
      .map(time => {
        const [hourMin, period] = time.trim().split(' ');
        let [hour, minute] = hourMin.split(':');
  
        // Pad hours and minutes
        hour = hour.padStart(2, '0');
        minute = minute.padStart(2, '0');
  
        return `${hour}:${minute} ${period}`;
      })
      .join(' - ');
  }
  
  module.exports = {
    normalizeTime
  };
  