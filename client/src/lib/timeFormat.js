const timeFormat = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const minutesRemindes = minutes % 60;
  return `${hours}h ${minutesRemindes}m`;
};

export default timeFormat;
