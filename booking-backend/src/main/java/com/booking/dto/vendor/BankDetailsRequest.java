package com.booking.dto.vendor;

import com.booking.model.enums.PaymentMethod;
import com.cloudinary.provisioning.Account;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalTime;

@Setter
@Getter
public class BankDetailsRequest{

    @NotBlank(message = "Account Number name is required.")
    private String accountHolder;

    @NotNull(message = "Bank Name is required.")
    private String bankName;

    @NotNull(message = "Account Number is required.")
    private String accountNumber;

    @NotNull(message = "IFSCCode is required.")
    private String IFSCCode;

    @NotNull(message = "UpiId is required.")
    private String  UpiId;

    private PaymentMethod primaryPrimary ;

}
