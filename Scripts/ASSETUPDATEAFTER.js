aa.print("============Asset Update After===begin======================");

var assetMasterPK = aa.env.getValue("AssetMasterPK");

if(assetMasterPK!=null)
{
  aa.print("##AssetSequenceNumber:" + assetMasterPK.getG1AssetSequenceNumber());
}

aa.env.setValue("ScriptReturnMessage", "EMSE operation successful.");

aa.print("============Asset Update After==end======================");