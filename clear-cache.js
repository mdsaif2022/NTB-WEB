// Clear localStorage cache for tours
if (typeof window !== 'undefined') {
  localStorage.removeItem('echoForgeTours');
  console.log('Tour cache cleared!');
  window.location.reload();
}
