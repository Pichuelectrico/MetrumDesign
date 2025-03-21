$(function () {
  $(
    '[data-form-type="blocs-form"] input,[data-form-type="blocs-form"] textarea'
  ).jqBootstrapValidation({
    preventSubmit: true,
    submitSuccess: function ($form, event) {
      if (!$form.attr("action")) {
        // Check form doesnt have action attribute
        event.preventDefault(); // prevent default submit behaviour

        var processorFile = getProcessorPath($form);
        var formData = {};

        $form.find("input, textarea, option:selected").each(function (
          e // Loop over form objects build data object
        ) {
          var fieldData = $(this).val();
          var fieldID = $(this).attr("id");

          if ($(this).is(":checkbox")) {
            // Handle Checkboxes
            fieldData = $(this).is(":checked");
          } else if ($(this).is(":radio")) {
            // Handle Radios
            fieldData = $(this).val() + " = " + $(this).is(":checked");
          } else if ($(this).is("option:selected")) {
            // Handle Option Selects
            fieldID = $(this).parent().attr("id");
          }

          formData[fieldID] = fieldData;
        });

        $.ajax({
          url: processorFile,
          type: "POST",
          data: formData,
          cache: false,
          success: function (
            data // Success
          ) {
            if ($form.find("#form-feedback-alert").length == 0) {
              // Add Alert
              $form.append(
                "<div id='form-feedback-alert' class='mt-2'><div class='alert alert-success' role='alert'><button type='button' class='btn-close float-end' data-bs-dismiss='alert' aria-hidden='true'></button><strong></strong></div></div>"
              );
            }

            var alert = $("#form-feedback-alert .alert");

            if (data == "capture-error" || data == "capture-connection-error") {
              // Capture Error
              var type = "warning";

              if (data == "capture-connection-error") {
                type = "fail";
              }

              $("#form-feedback-alert strong").html(
                $form.find(".g-recaptcha").attr("data-capture-" + type)
              );
              alert.addClass("alert-danger").removeClass("alert-success");
            } // Success
            else {
              if ($form.is("[data-success-msg]")) {
                // Show Success Message
                alert.addClass("alert-success").removeClass("alert-danger");
                $("#form-feedback-alert strong").html(
                  $form.attr("data-success-msg")
                );
                $form.trigger("reset"); // Clear Form
              } // Re-Direct
              else {
                window.location.replace($form.attr("data-success-url"));
              }
            }
          },
          error: function (
            xhr,
            status,
            error // Error Posting Form
          ) {
            if ($("#form-alert").length == 0) {
              $form.append(
                "<div id='form-alert' class='mt-2'><div class='alert alert-danger' role='alert'><button type='button' class='btn-close float-end' data-bs-dismiss='alert' aria-hidden='true'></button><strong>" +
                  $form.attr("data-fail-msg") +
                  "</strong></div></div>"
              );
            }

            // Log Error
            var response = $.parseJSON(xhr.responseText);
            console.log("Mail Error: " + response.message);
          },
        });
      }
    },
    filter: function () // Handle hidden form elements
    {
      return $(this).is(":visible");
    },
  });

  // Get Path to processor PHP file
  function getProcessorPath(form) {
    var path = siteRelativeURLPath + "includes/" + form.attr("id") + ".php";

    if (form.attr("template-path")) {
      // Check For Template Path (Wordpress)
      path =
        form.attr("template-path") + "/includes/" + form.attr("id") + ".php";
    }

    return path;
  }
});
