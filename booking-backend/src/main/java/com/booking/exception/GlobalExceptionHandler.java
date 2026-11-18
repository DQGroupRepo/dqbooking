package com.booking.exception;

import com.booking.dto.common.ErrorResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log =
            LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleResourceNotFound(
            ResourceNotFoundException ex) {

        log.warn(
                "Resource not found: {}",
                ex.getMessage()
        );
        ErrorResponse error = new ErrorResponse(
                HttpStatus.NOT_FOUND.value(),
                ex.getMessage(),
                LocalDateTime.now()
        );

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(error);
    }


    /*
     * =========================================
     * ACCESS DENIED
     * =========================================
     *
     * Authenticated user attempted an operation
     * for which they do not have permission.
     *
     * This is intentionally HTTP 403 and must
     * NOT be treated as an authentication failure.
     */

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(
            AccessDeniedException ex
    ) {

        log.warn(
                "Access denied: {}",
                ex.getMessage()
        );
        String message =
                ex.getMessage();

        if (
                message == null ||
                        message.isBlank()
        ) {

            message =
                    "You do not have permission to perform this action.";

        }


        ErrorResponse errorResponse =
                new ErrorResponse(
                        HttpStatus.FORBIDDEN.value(),
                        message,
                        LocalDateTime.now()
                );


        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(errorResponse);

    }

    @ExceptionHandler(InvalidCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleInvalidCredentials(
            InvalidCredentialsException ex
    ) {

        log.warn(
                "Invalid Credentials: {}",
                ex.getMessage()
        );
        String message =
                ex.getMessage();

        if (
                message == null ||
                        message.isBlank()
        ) {

            message =
                    "Invalid Credentials.";

        }


        ErrorResponse errorResponse =
                new ErrorResponse(
                        HttpStatus.UNAUTHORIZED.value(),
                        message,
                        LocalDateTime.now()
                );


        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(errorResponse);

    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleMethodArgumentNotValid(
            MethodArgumentNotValidException ex
    ) {

        log.warn(
                "Invalid Method Arguments - Validation failed: {}",
                ex.getMessage()
        );
        String message =
                ex.getMessage();

        if (
                message == null ||
                        message.isBlank()
        ) {

            message =
                    "Invalid method arguments - Validation failed.";

        }


        ErrorResponse errorResponse =
                new ErrorResponse(
                        HttpStatus.PRECONDITION_FAILED.value(),
                        "Invalid values entered - Validation failed.",
                        LocalDateTime.now()
                );


        return ResponseEntity
                .status(HttpStatus.PRECONDITION_FAILED)
                .body(errorResponse);

    }

    @ExceptionHandler(FileSizeExceededException.class)
    public ResponseEntity<ErrorResponse> handleFileSizeExceeded(
            FileSizeExceededException ex
    ) {

        log.warn(
                "File upload rejected: {}",
                ex.getMessage()
        );
        ErrorResponse errorResponse =
                new ErrorResponse(
                        HttpStatus.PAYLOAD_TOO_LARGE.value(),
                        ex.getMessage(),
                        LocalDateTime.now()
                );


        return ResponseEntity
                .status(HttpStatus.PAYLOAD_TOO_LARGE)
                .body(errorResponse);

    }


    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ErrorResponse> handleMaxUploadSizeExceeded(
            MaxUploadSizeExceededException ex
    ) {

        log.warn(
                "Maximum upload size exceeded"
        );

        ErrorResponse errorResponse =
                new ErrorResponse(
                        HttpStatus.PAYLOAD_TOO_LARGE.value(),
                        ex.getMessage(),
                        LocalDateTime.now()
                );


        return ResponseEntity
                .status(HttpStatus.PAYLOAD_TOO_LARGE)
                .body(errorResponse);

    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ErrorResponse> handleIllegalStateException(
            IllegalStateException ex
    ) {

        log.warn(
                "Business validation failed: {}",
                ex.getMessage()
        );
        ErrorResponse error =
                new ErrorResponse(
                        HttpStatus.BAD_REQUEST.value(),
                        ex.getMessage(),
                        LocalDateTime.now()
                );

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(error);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleUnexpectedException(
            Exception ex
    ) {

        log.error(
                "Unhandled application exception",
                ex
        );

        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse(
                        HttpStatus.INTERNAL_SERVER_ERROR.value(),
                        "An unexpected error occurred",
                        LocalDateTime.now()
                ));
    }

    @ExceptionHandler(ExpiredBookingHoldException.class)
    public ResponseEntity<Map<String, Object>> handleExpiredBookingHold(
            ExpiredBookingHoldException ex
    ) {

        log.warn(
                "Expired booking hold detected serviceId={} slotId={} eventDate={}",
                ex.getServiceId(),
                ex.getSlotId(),
                ex.getEventDate()
        );

        Map<String, Object> response =
                new LinkedHashMap<>();

        response.put(
                "status",
                412
        );

        response.put(
                "message",
                ex.getMessage()
        );

        response.put(
                "code",
                "BOOKING_HOLD_EXPIRED"
        );

        response.put(
                "serviceId",
                ex.getServiceId()
        );

        response.put(
                "slotId",
                ex.getSlotId()
        );

        response.put(
                "eventDate",
                ex.getEventDate()
        );

        response.put(
                "holdId",
                ex.getHoldId()
        );

        response.put(
                "timestamp",
                LocalDateTime.now()
        );

        return ResponseEntity
                .status(HttpStatus.PRECONDITION_FAILED)
                .body(response);
    }
}