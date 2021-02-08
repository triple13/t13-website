<?php
     if ( ! isset( $_POST['contact_form'] ) ) {

          /*/ this is the email we get from visitors*/
          $domain_url = (isset($_SERVER['HTTPS']) ? "https" : "http") . "://$_SERVER[HTTP_HOST]";
          $valid_cors = array("localhost","triple13.io");
          header( 'access-control-allow-credentials:true' );
          header("Content-type: application/json");
          header('Access-Control-Allow-Origin: https://{$valid_cors}', false);
          header("Access-Control-Allow-Methods: POST ");
          header("Access-Control-Allow-Origin: ". str_replace('.', '-', "https://triple13.io") .".cdn.ampproject.org");
          header("AMP-Access-Control-Allow-Source-Origin: ".$domain_url);
          header( 'access-control-expose-headers:AMP-Access-Control-Allow-Source-Origin' );

          $your_name = filter_var( $_POST['your_name'], FILTER_SANITIZE_STRING );
          $your_email = filter_var( $_POST['your_email'], FILTER_SANITIZE_EMAIL );
          $your_subject = filter_var( $_POST['your_subject'], FILTER_SANITIZE_STRING );
          $your_message = filter_var( $_POST['your_message'], FILTER_SANITIZE_STRING );
          if ( ! empty( $your_name ) && ! empty( $your_email ) ) {
               // Output message
               $output_message = 'Thanks, '. $your_name . '. Your message was sent successfully.';

               // Email to the website admin
               $compiled_message = 'Name: ' . $your_name . "\r\n";
               $compiled_message .= 'Email: ' . $your_email . "\r\n";
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
