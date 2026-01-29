# Client Requirements - AI-Based Parts Identification and Inventory System

## 1\. Background

The client works with many mechanical parts that are visually similar in shape but differ in size. Parts typically have no SKUs or visible part numbers, so manually identifying, counting, and pricing them is slow and error‑prone, especially when handling batches of 50-100+ parts at a time.

## 2\. Overall Goal

Develop an application that uses computer vision and a reference cutting mat to automatically identify parts, determine their physical size, count quantities, compute prices, and maintain inventory records. The client must be able to build and maintain their own catalog (library) of parts inside the app.

## 3\. Functional Requirements

### 3.1 Image Acquisition and Reference Mat

- Parts are placed on a dedicated cutting/reference mat that has clear measurement markings (grid / scale) to allow conversion from pixels to real‑world units.
- The app must support capturing 1-3 images of each part from different angles to capture its geometry.
- During a scan session, multiple parts may be placed on the mat at once (e.g., 50-100+ parts in a single batch).

### 3.2 Parts Library Creation

- The client can create and manage a custom parts library within the app.
- For each new part type, the user captures 1-3 reference images on the mat from different viewpoints.
- For every library entry, the app stores: part images, measured dimensions (from the mat), part name/ID, and unit price.
- The library must support multiple size variants of the same part type (e.g., around 10 different sizes per shape).

### 3.3 Part Identification and Size Measurement

- Given scan images of parts on the mat, the system detects each individual part in the scene.
- Using the mat's grid/scale, the system converts pixel dimensions to real‑world units (mm/inches) to estimate size.
- The system distinguishes between parts that share the same shape but differ in size by using calibrated measurements.
- If the system cannot confidently identify a part/size from current images, it should request additional angles/images.

### 3.4 Scanning, Counting, and Pricing

- Provide a Scan mode that processes one or more images of a batch of parts on the mat.
- Automatically identify part type and size for each detected object using the parts library.
- Count the quantity of each part type/size present in the scan.
- Look up the price per part from the library and calculate line totals and overall total price for the batch.

### 3.5 Handling Unknown or Unrecognized Parts

- If a part is not recognized (no suitable match in the library), flag it as Unknown during the scan.
- Within the same scan workflow, allow the user to add the unknown part to the library by capturing the required angles, entering metadata (name, category, etc.), and specifying its price.
- Once added, the system should be able to immediately re‑use this new entry for the current and future scans.

### 3.6 Inventory Management

- Provide an Inventory section that tracks quantity on hand for each part type/size.
- Each completed scan representing a sale or outgoing batch should decrement inventory and record a transaction (date/time, parts, quantities, total value).
- Inventory views should at minimum show current stock levels and basic history of parts sold/used.

### 3.7 Reporting and Export (Optional)

- Export scan summaries and inventory data to CSV/Excel or PDF for accounting or record‑keeping purposes.
- Basic summary reports of counts and totals per period (daily/weekly/monthly) are desirable but not mandatory.

## 4\. Non-Functional Considerations

- The system must be significantly faster than manual counting and pricing, even when multiple images are required.
- User interface should be straightforward so non‑technical users can create library entries and run scans easily.
- Size measurement accuracy should be sufficient for correct pricing (target within approximately ±1-2% of actual dimensions in controlled setups).