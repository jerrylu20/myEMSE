var publicUserModel= aa.env.getValue("PublicUserModel");

var mailFrom = "eBUILD-noreply@cityofchesapeake.net";
var mailTo = "carol.gong@missionsky.com";
var mailCC = "carly.xu@missionsky.com";

var currentDate = aa.util.formatDate(aa.util.now(),"MM/dd/yyyy");

if(publicUserModel != null)
{
	var templateName = "CONTACTRELATEDTOPU";
	sendNotification(mailTo,templateName);
}
aa.env.setValue("ScriptReturnCode", "0");
aa.env.setValue("ScriptReturnMessage", "Event Fire.");

/*
 * get params for resubmit
 */
function getParamsForPublish(publicUserModel)
{
	var params = aa.util.newHashtable();
	if(publicUserModel != null)
	{
		var peopleList = publicUserModel.getPeoples();
		var peopleModel = null;
		
		if(peopleList != null || peopleList.length > 0)
		{
			var it = peopleList.iterator();
     	while(it.hasNext())
     	{
				peopleModel = it.next();
				break;
			}
		}
		
		addParameter(params, "$$userID$$", publicUserModel.getUserID());
		addParameter(params, "$$userFullName$$", getUserFullName(publicUserModel));
		
		if(peopleModel != null)
		{
			addParameter(params, "$$contactName$$", peopleModel.getContactName());
			addParameter(params, "$$businessName$$", peopleModel.getBusinessName());
			addParameter(params, "$$currentDate$$", currentDate);
		}
	}
	return params;
}

/*
 * Get full name from PublicUserModel.
 */
function getUserFullName(publicUser) 
{
	var emptyString = /^\s*$/;
	var result = '';

	if (publicUser != null) 
	{
		result = publicUser.getFullName();

		if (!result || emptyString.test(result)) 
		{
			var firstName = publicUser.getFirstName();
			var middleName = publicUser.getMiddleName();
			var lastName = publicUser.getLastName();

			if (firstName && !emptyString.test(firstName)) 
			{
				result = firstName;
			}

			if (middleName && !emptyString.test(middleName)) 
			{
				if (result && !emptyString.test(result)) 
				{
					result += ' ';
				}

				result += middleName;
			}

			if (lastName && !emptyString.test(lastName)) 
			{
				if (result && !emptyString.test(result)) 
				{
					result += ' ';
				}

				result += lastName;
				}
			}
	}

	return result;
}


/*
 * Send notification
 */
function sendNotification(userEmailTo,templateName)
{
	var params = getParamsForPublish(publicUserModel);
	
	var result = aa.people.sendEmailAfterCreateContact(mailFrom, userEmailTo, mailCC, templateName, params);
	if(result.getSuccess())
	{
		aa.log("Sent email successfully!");
		return true;
	}
	else
	{
		aa.log("Failed to send mail.");
		return false;
	}
}

/*
 * add parameter
 */
function addParameter(pamaremeters, key, value)
{
	if(key != null)
	{
		if(value == null)
		{
			value = "";
		}
		pamaremeters.put(key, value);
	}
}