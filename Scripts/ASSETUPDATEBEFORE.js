aa.print("============Asset Update Before===begin======================");

var assetDataModel = aa.env.getValue("AssetDataModel");

if(assetDataModel!=null)
{
 var assetMasterModel = assetDataModel.getAssetMaster();
 var attributeList = assetDataModel.getDataAttributes();

 if(assetMasterModel!=null)
 {
  aa.print("##AssetMasterModel.getServiceProviderCode():" + assetMasterModel.getServiceProviderCode());
  aa.print("##AssetMasterModel.getG1AssetSequenceNumber():" + assetMasterModel.getG1AssetSequenceNumber());
  aa.print("##AssetMasterModel.getG1AssetID():" + assetMasterModel.getG1AssetID());
  aa.print("##AssetMasterModel.getG1AssetGroup():" + assetMasterModel.getG1AssetGroup());
  aa.print("##AssetMasterModel.getG1AssetType():" + assetMasterModel.getG1AssetType());
  aa.print("##AssetMasterModel.getAssetSize():" + assetMasterModel.getAssetSize());
 
  aa.print("##AssetMasterModel.getCurrentValue():" + assetMasterModel.getCurrentValue());
  aa.print("##AssetMasterModel.getDateOfService():" + assetMasterModel.getDateOfService());
  aa.print("##AssetMasterModel.getDependentFlag():" + assetMasterModel.getDependentFlag());
  aa.print("##AssetMasterModel.getDepreciationAmount():" + assetMasterModel.getDepreciationAmount());
  aa.print("##AssetMasterModel.getDepreciationValue():" + assetMasterModel.getDepreciationValue());
  aa.print("##AssetMasterModel.getStartValue():" + assetMasterModel.getStartValue());
  aa.print("##AssetMasterModel.getUseFulLife():" + assetMasterModel.getUseFulLife());
  aa.print("##AssetMasterModel.getStartDate():" + assetMasterModel.getStartDate());
  aa.print("##AssetMasterModel.getEndDate():" + assetMasterModel.getEndDate());
  aa.print("##AssetMasterModel.getSalvageValue():" + assetMasterModel.getSalvageValue());  
  aa.print("##AssetMasterModel.getCapTypeString():" + assetMasterModel.getCapTypeString());
  aa.print("##AssetMasterModel.getEndAssetID():" + assetMasterModel.getEndAssetID());
  aa.print("##AssetMasterModel.getEndAssetSize():" + assetMasterModel.getEndAssetSize());
  aa.print("##AssetMasterModel.getEndDateOfService():" + assetMasterModel.getEndDateOfService());
  aa.print("##AssetMasterModel.getEndEndDate():" + assetMasterModel.getEndEndDate());
  aa.print("##AssetMasterModel.getEndStartDate():" + assetMasterModel.getEndStartDate());
  aa.print("##AssetMasterModel.getEndStatusDate():" + assetMasterModel.getEndStatusDate());
  aa.print("##AssetMasterModel.getG1AssetComments():" + assetMasterModel.getG1AssetComments());
  aa.print("##AssetMasterModel.getG1AssetStatus():" + assetMasterModel.getG1AssetStatus());
  aa.print("##AssetMasterModel.getG1AssetStatusDate():" + assetMasterModel.getG1AssetStatusDate());
  aa.print("##AssetMasterModel.getG1ClassType():" + assetMasterModel.getG1ClassType());
  aa.print("##AssetMasterModel.getG1Description():" + assetMasterModel.getG1Description());
  aa.print("##AssetMasterModel.getCostLTD():" + assetMasterModel.getCostLTD());
  aa.print("##AssetMasterModel.getParentAsset():" + assetMasterModel.getParentAsset());
  aa.print("##AssetMasterModel.getRecDate():" + assetMasterModel.getRecDate());
  aa.print("##AssetMasterModel.getRecFulNam():" + assetMasterModel.getRecFulNam());
  aa.print("##AssetMasterModel.getRecStatus():" + assetMasterModel.getRecStatus());
  
  aa.print("##AssetMasterModel.getSizeUnit():" + assetMasterModel.getSizeUnit());
  aa.print("##AssetMasterModel.getStartAssetID():" + assetMasterModel.getStartAssetID());
  
 }
 
 if(attributeList !=null && attributeList.size() >0)
 {
  aa.print("attributeList.size(): " + attributeList.size());

  var it = attributeList.iterator();
  while(it.hasNext())
  {
   var dataAttributeModel = it.next();  
   aa.print("Name:"     + dataAttributeModel.getG1AttributeName());
   aa.print("Value:"      + dataAttributeModel.getG1AttributeValue());
  }
 }
}

//For Demo
var assetComment = assetMasterModel.getG1AssetComments();

if(assetComment!= '' && assetComment == 'error')
{
 aa.env.setValue("ScriptReturnCode","-1");
 aa.env.setValue("ScriptReturnMessage","EMSE operation failed.");
}
else
{
 aa.env.setValue("ScriptReturnMessage","EMSE operation successful.");
}

aa.print("============Asset Update Before==end======================");