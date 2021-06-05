# OTCAuto

---

## Dialerbase example:

The available fields to load information from your parandval will be the following:

```jsx
[
  "txtID",
  "txtFullname",
  "txtPhone",
  "txtEmail",
  "txtSalesrep",
  "txtCustom1",
  "txtCampaignid",
  "txtMake",
  "txtModel",
  "txtYear",
];
```

Dialerbase example:

```jsx
ODCAuto-test->;22264614;txtFullname=Gaston Morales:txtEmail=gaston@gmail.com:txtMake=Chery:txtModel=QQ:txtYear=2009;;9999;
```

## How to install

# SQL Tables and files:

### OTCAuto_customers:

Customers information

```sql
CREATE TABLE `OTCAuto_customers` (
  `id_customer` int(100) UNSIGNED NOT NULL AUTO_INCREMENT,
  `ID` varchar(40) DEFAULT '',
  `fullname` varchar(100) DEFAULT '',
  `phone` varchar(20) DEFAULT '',
  `email` varchar(100) DEFAULT '',
  `salesrep` varchar(100) DEFAULT '',
  `custom1` varchar(100) DEFAULT '',
  `campaignid` varchar(40) DEFAULT '',
  `make` varchar(100) DEFAULT '',
  `model` varchar(140) DEFAULT '',
  `year` int(10) DEFAULT 0,
  `files` longtext DEFAULT NULL,
  `active` int(1) DEFAULT 1,
  `agent` varchar(100) DEFAULT NULL,
  `date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_customer`),
  KEY `Index_doc` (`ID`) USING BTREE,
  KEY `Index_name` (`fullname`) USING BTREE,
  KEY `Index_phone` (`phone`) USING BTREE,
  KEY `Index_agent` (`agent`) USING BTREE,
  KEY `active` (`active`)
) ENGINE=InnoDB AUTO_INCREMENT=4629 DEFAULT CHARSET=utf8;
```

### OTCAuto_management:

managements history identify by id_customer

```sql
CREATE TABLE `OTCAuto_management` (
  `id` int(100) UNSIGNED NOT NULL AUTO_INCREMENT,
  `id_customer` int(100) UNSIGNED DEFAULT 0,
  `date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `agent` varchar(100) DEFAULT '',
  `lvl1` varchar(100) DEFAULT '',
  `lvl2` varchar(100) DEFAULT '',
  `lvl3` varchar(100) DEFAULT '',
  `note` varchar(800) DEFAULT '',
  `queuename` varchar(100) DEFAULT NULL,
  `channel` varchar(40) DEFAULT NULL,
  `guid` varchar(100) DEFAULT NULL,
  `callid` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `Index_channel` (`channel`),
  KEY `Index_lvl1` (`lvl1`),
  KEY `Index_lvl2` (`lvl2`),
  KEY `Index_lvl3` (`lvl3`),
  KEY `Index_results` (`lvl1`,`lvl2`,`lvl3`),
  KEY `Index_queue` (`queuename`),
  KEY `Index_guid` (`guid`),
  KEY `Index_agent` (`agent`),
  KEY `index_date` (`date`)
) ENGINE=InnoDB AUTO_INCREMENT=109 DEFAULT CHARSET=utf8;
```

### OTCAuto speachs:

```sql
CREATE TABLE `ccrepo`.`OTCAuto_speach` (
  `id` int(100) UNSIGNED NOT NULL AUTO_INCREMENT,
  `speach` longtext DEFAULT NULL,
  `queuename` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `Index_ID` (`id`),
  KEY `Index_queuename` (`queuename`)
) ENGINE=InnoDB AUTO_INCREMENT=109 DEFAULT CHARSET=utf8;
```

### OTCAuto's report:

```sql
INSERT INTO ccdata.reports (name, file, description, DSN, parameters, grouped, language, license, visible)
VALUES ('OTCAuto - Management and Customer information detail', 'OTCAutoManagementCustomerDetail.jrxml', '', 'Repo', 'INITIAL_DATE:Timestamp;FINAL_DATE:Timestamp;QUEUE:Queue;', 'OTCAUTO', 'en', 'CCS', 1),
('OTCAuot - Detalle de gestiones y clientes', 'OTCAutoManagementCustomerDetail.jrxml', 'Gestiones realizadas sobre OTCAuto e informacion de los clientes respectivos', 'Repo', 'INITIAL_DATE:Timestamp;FINAL_DATE:Timestamp;QUEUE:Queue;', 'OTCAUTO', 'es', 'CCS', 1);
```

## OTCAuto files:

Put the folder named "OTCAuto" into this path:

```bash
/etc/IntegraServer/web/forms/
```

The content of the folder "reports" into this another path:

```bash
/etc/IntegraServer/reports/
```
