aa.print("LicProRemoveBefore debug");

aa.print("CurrentUserID =" + aa.env.getValue("CurrentUserID")); 
aa.print("licenseNbr =" + aa.env.getValue("licenseNbr"));
aa.print("LicenseNbrList =" + aa.env.getValue("LicenseNbrList"));

aa.env.setValue("ScriptReturnCode","0");
aa.env.setValue("ScriptReturnMessage","LicProRemoveBefore successful");