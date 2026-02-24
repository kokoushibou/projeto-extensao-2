export const todayIso = () => new Date().toISOString().slice(0, 10);

export const addDays = (baseDate: string, diff: number) => {
  const d = new Date(`${baseDate}T00:00:00`);
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
};

export const nowTime = () => {
  const d = new Date();
  const h = `${d.getHours()}`.padStart(2, '0');
  const m = `${d.getMinutes()}`.padStart(2, '0');
  return `${h}:${m}`;
};
