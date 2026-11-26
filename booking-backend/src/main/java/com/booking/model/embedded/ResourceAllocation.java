package com.booking.model.embedded;

import lombok.Getter;
import lombok.Setter;
import java.util.ArrayList;
import java.util.List;

/** Snapshot of physical units allocated from one resource type. */
@Getter
@Setter
public class ResourceAllocation {
    private String resourceTypeId;
    private List<String> resourceIds = new ArrayList<>();
}
