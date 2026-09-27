package com.booking.model;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;

@Getter
@Setter
public abstract class BaseEntity {

    @Id
    private String id;


    /*
     * =========================================
     * CREATION AUDIT
     * =========================================
     */

    @CreatedDate
    @Field("created_ts")
    private LocalDateTime createdTs;


    @CreatedBy
    @Field("created_user")
    private String createdUser;


    /*
     * =========================================
     * LAST UPDATE AUDIT
     * =========================================
     */

    @LastModifiedDate
    @Field("last_update_ts")
    private LocalDateTime lastUpdateTs;


    @LastModifiedBy
    @Field("last_update_user")
    private String lastUpdateUser;


    /*
     * =========================================
     * COMMON STATUS
     * =========================================
     */

    private Boolean active = true;

    private Boolean deleted = false;

}