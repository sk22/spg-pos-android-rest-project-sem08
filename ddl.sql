USE `pos_android_events`;

CREATE TABLE `e_events` (
  `e_id` int(11) NOT NULL AUTO_INCREMENT,
  `e_title` varchar(120) NOT NULL,
  `e_description` text,
  `e_start_date` datetime NOT NULL,
  `e_end_date` datetime NOT NULL,
  `e_all_day` tinyint(1) DEFAULT '0',
  `e_u_organizer` int(11) DEFAULT NULL,
  `e_v_venue` int(11) DEFAULT NULL,
  PRIMARY KEY (`e_id`),
  KEY `fk_e_u_organizer` (`e_u_organizer`),
  KEY `fk_e_v_venue` (`e_v_venue`),
  CONSTRAINT `fk_e_u_organizer` FOREIGN KEY (`e_u_organizer`) REFERENCES `u_users` (`u_id`),
  CONSTRAINT `fk_e_v_venue` FOREIGN KEY (`e_v_venue`) REFERENCES `v_venues` (`v_id`)
);

CREATE TABLE `o_organizers` (
  `o_id` int(11) NOT NULL AUTO_INCREMENT,
  `o_name` varchar(120) NOT NULL,
  `o_description` text,
  PRIMARY KEY (`o_id`)
);

CREATE TABLE `u_users` (
  `u_id` int(11) NOT NULL AUTO_INCREMENT,
  `u_username` varchar(120) NOT NULL,
  `u_password` varchar(120) NOT NULL,
  `u_token` varchar(120) DEFAULT NULL,
  `u_registered` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `u_logged_in` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`u_id`),
  UNIQUE KEY `u_username` (`u_username`)
);

CREATE TABLE `ue_users_events` (
  `ue_u_user` int(11) NOT NULL,
  `ue_e_event` int(11) NOT NULL,
  `ue_status` enum('going','interested','not going') DEFAULT NULL,
  PRIMARY KEY (`ue_u_user`, `ue_e_event`),
  CONSTRAINT `fk_ue_e_event` FOREIGN KEY (`ue_e_event`) REFERENCES `e_events` (`e_id`),
  CONSTRAINT `fk_ue_u_user` FOREIGN KEY (`ue_u_user`) REFERENCES `u_users` (`u_id`)
);

CREATE TABLE `v_venues` (
  `v_id` int(11) NOT NULL AUTO_INCREMENT,
  `v_name` varchar(120) DEFAULT NULL,
  `v_address` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`v_id`)
);
