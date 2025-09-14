/**
 * @author DiZed Team
 * @copyright Copyright (c) DiZed Team (https://github.com/di-zed/)
 */
$(document).ready(() => {
  const forms = $('.needs-validation');

  $.each(forms, (i, form) => {
    $(form).on('submit', (event) => {
      if (!form.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
      } else {
        const fields = $(form).find(':text, :password, input[type="email"]');
        const button = $(form).find('button:submit');

        $(fields).prop('readonly', true);

        $(button).find('.spinner-border').show();
        $(button).prop('disabled', true);
      }

      $(form).addClass('was-validated');
    });
  });
});
