export const formatDate = (isDate) => {
  const date = new Date(isDate);
  return date.toLocaleDateString('en-Us', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}