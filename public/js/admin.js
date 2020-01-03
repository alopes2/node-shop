const deleteProduct = async (btn) => {
  const prodId = btn.parentNode.querySelector('[name=productId]').value;
  const csrfToken = btn.parentNode.querySelector('[name=_csrf]').value;

  const productElement = btn.closest('article');

  try {
    const result = await fetch(`/admin/product/${prodId}`, {
      method: 'DELETE',
      headers: {
        'csrf-token': csrfToken
      }
    });

    productElement.parentNode.removeChild(productElement);
    
    const data = await result.json();
    console.log(data);
  } catch(e) {
    console.log(e);
  }
};