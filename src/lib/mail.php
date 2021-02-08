<?php
     if ( ! isset( $_POST['contact_form'] ) ) {
          header( 'access-control-allow-credentials:true' );
          header( 'access-control-allow-headers:Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token' );
          header( 'access-control-allow-methods:POST, GET, OPTIONS' );
          header( 'access-control-allow-origin:' . $_SERVER['HTTP_ORIGIN'] );
          header( 'access-control-expose-headers:AMP-Access-Control-Allow-Source-Origin' );
          header( 'amp-access-control-allow-source-origin:https://' . $_SERVER['HTTP_HOST'] );
          header( 'Content-Type: application/json' );
          $your_name = filter_var( $_POST['your_name'], FILTER_SANITIZE_STRING );
          $your_email = filter_var( $_POST['your_email'], FILTER_SANITIZE_EMAIL );
          $your_telephone = filter_var( $_POST['your_telephone'], FILTER_SANITIZE_STRING );
          $your_subject = filter_var( $_POST['your_subject'], FILTER_SANITIZE_STRING );
          $your_message = filter_var( $_POST['your_message'], FILTER_SANITIZE_STRING );
          if ( ! empty( $your_name ) && ! empty( $your_email ) ) {
               // Output message
               $output_message = 'Thanks, '. $your_name . '. Your message was sent successfully.';

               // Email to the website admin
               $compiled_message = 'Name: ' . $your_name . "\r\n";
               $compiled_message .= 'Email: ' . $your_email . "\r\n";
               $compiled_message .= 'Telephone: ' . $your_telephone . "\r\n";
               $compiled_message .= 'Subject: ' . $your_subject . "\r\n";
               $compiled_message .= 'Message: ' . $your_message;
               mail( 'sj@triple13.io', 'Example Subject', $compiled_message ); // Please change the example email address
          } else {
               // Front-end error message
               $output_message = 'Sorry, there was an error processing your message.';
          }
          $output = ['output_message' => $output_message];
          echo json_encode( $output );
     }
?>
