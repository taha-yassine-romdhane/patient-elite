# Patient Report for ID: cmd4n1iod0003xi2wyomryx7z

This report details all available information for the patient, including personal data, diagnostic records, sales, and rentals.

## Patient Information

| Field | Value |
|---|---|
| **ID** | `cmd4n1iod0003xi2wyomryx7z` |
| **Full Name** | mohamed b |
| **Phone** | 55820000 FILS BADER |
| **CIN** | 09308504 |
| **Region** | Sousse |
| **Address** | Msaken, 92 rue sidi abaar |
| **Doctor** | DR ABDELHAMID GARROUCH |
| **CNAM** | Yes (ID: 15800/98) |
| **Affiliation** | CNSS |
| **Beneficiary** | SOCIAL_INSURED |

## Diagnostic History

### Record 1
- **Date**: 2025-07-14
- **Type**: PORTI
- **IAH/ID**: 41 / 39

### Record 2
- **Date**: 2025-07-14
- **Type**: PORTI
- **IAH/ID**: 25 / 18
- **Notes**: test diagnostic

### Record 3
- **Date**: 2025-07-14
- **Type**: PORTI
- **IAH/ID**: 25 / 18
- **Notes**: test diagnostic

## Sales History

### Sale ID: `cmd4n9ndi0004xi2wbl43ygtm`
- **Date**: 2021-07-28
- **Amount**: 1675
- **Status**: PENDING

**Items Sold:**
- **Device**: CPAP (YH550), SN: CPAP-4545
- **Accessory**: MASQUE NASAL L (YN02)

**Payments:**
- No payments recorded for this sale.

## Rental History

### Rental ID: `cmd5239ed0000xim81cw5ehva`
- **Period**: 2024-12-31 to 2025-01-29
- **Amount**: 3150.01
- **Status**: PENDING
- **Return**: NOT_RETURNED

**Items Rented:**
- **Device 1**: BIPAP (YH-830), SN: YH-83000001
- **Device 2**: Concentrateur 10L (8F-10), SN: 8F8900001
- **Device 3**: BT O² (LINDE GAZ), SN: B500001

**Payments:**
- **Payment 1**: 2580 (CNAM), ACCORD
- **Payment 2**: 570 (CNAM), ACCORD
- **Payment 3**: 0.01 (CASH)

---

## JSON Data Structure

```json
{
  "patient": {
    "id": "cmd4n1iod0003xi2wyomryx7z",
    "createdAt": "2025-07-15T13:39:07.213Z",
    "updatedAt": "2025-07-15T13:50:42.384Z",
    "date": "2025-07-15T13:39:07.210Z",
    "fullName": "mohamed b ",
    "phone": "55820000 FILS BADER",
    "region": "Sousse",
    "address": "Msaken, 92 rue sidi abaar",
    "doctorName": "DR ABDELHAMID GARROUCH",
    "technicianId": "cmd3j1l4c0000xi60dib9d1fl",
    "cin": "09308504",
    "supervisorId": "cmd3j1l4c0000xi60dib9d1fl",
    "affiliation": "CNSS",
    "beneficiary": "SOCIAL_INSURED",
    "cnamId": "15800/98",
    "hasCnam": true,
    "addressDetails": "92 rue sidi abaar"
  },
  "diagnostics": [
    {
      "id": 4,
      "date": "2025-07-14T23:00:00.000Z",
      "polygraph": "PORTI",
      "iahResult": 41,
      "idResult": 39,
      "remarks": "",
      "patientId": "cmd4n1iod0003xi2wyomryx7z"
    },
    {
      "id": 10,
      "date": "2025-07-14T23:00:00.000Z",
      "polygraph": "PORTI",
      "iahResult": 25,
      "idResult": 18,
      "remarks": "test diagnostic",
      "patientId": "cmd4n1iod0003xi2wyomryx7z"
    },
    {
      "id": 11,
      "date": "2025-07-14T23:00:00.000Z",
      "polygraph": "PORTI",
      "iahResult": 25,
      "idResult": 18,
      "remarks": "test diagnostic",
      "patientId": "cmd4n1iod0003xi2wyomryx7z"
    }
  ],
  "sales": [
    {
      "id": "cmd4n9ndi0004xi2wbl43ygtm",
      "date": "2021-07-28T23:00:00.000Z",
      "amount": 1675,
      "status": "PENDING",
      "notes": null,
      "devices": [
        {
          "id": "cmd4n9ndi0005xi2wft2jzrbl",
          "name": "CPAP",
          "model": "YH550",
          "serialNumber": "CPAP-4545"
        }
      ],
      "accessories": [
        {
          "id": "cmd4n9ndx0006xi2wmg1pknqj",
          "name": "MASQUE NASAL L",
          "model": "YN02",
          "quantity": 1
        }
      ],
      "payments": []
    }
  ],
  "rentals": [
    {
      "id": "cmd5239ed0000xim81cw5ehva",
      "startDate": "2024-12-31T23:00:00.000Z",
      "endDate": "2025-01-29T23:00:00.000Z",
      "amount": 3150.01,
      "status": "PENDING",
      "returnStatus": "NOT_RETURNED",
      "notes": "TEST GLOBAL 1",
      "devices": [
        {
          "id": "cmd5239es0001xim8p33zn56j",
          "name": "BIPAP",
          "model": "YH-830",
          "serialNumber": "YH-83000001"
        },
        {
          "id": "cmd5239fx0004xim8oigxhchf",
          "name": "Concentrateur 10L",
          "model": "8F-10",
          "serialNumber": "8F8900001"
        },
        {
          "id": "cmd5239gf0007xim8lyyn0chy",
          "name": "BT O²",
          "model": "LINDE GAZ",
          "serialNumber": "B500001"
        }
      ],
      "accessories": [],
      "payments": [
        {
          "id": "cmd5239fl0003xim8uhhm98vw",
          "amount": 2580,
          "type": "CNAM",
          "cnamStatus": "ACCORD"
        },
        {
          "id": "cmd5239g80006xim89uctr9s7",
          "amount": 570,
          "type": "CNAM",
          "cnamStatus": "ACCORD"
        },
        {
          "id": "cmd5239gq0009xim8x93n0ryr",
          "amount": 0.01,
          "type": "CASH"
        }
      ]
    }
  ]
}
```
