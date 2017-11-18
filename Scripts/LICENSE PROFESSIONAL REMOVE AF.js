aa.print("LicProRemoveAfter debug");

aa.print("CAPId=" + aa.env.getValue("ApplicantId"));
aa.print("CurrentUserID =" + aa.env.getValue("CurrentUserID")); 
aa.print("LicenseNbr =" + aa.env.getValue("LicenseNbr"));
aa.print("LicenseNbrList =" + aa.env.getValue("LicenseNbrList"));

aa.env.setValue("ScriptReturnCode","0");
aa.env.setValue("ScriptReturnMessage","LicProRemoveAfter successful");