Explore the Frontend and backend of this codebase. 

I want to add a high level feature. 

Currently you can create a variety of tournaments, each with start and end dates. However to set the location, we currently just set a title in the match meta data manually. This is time consuming and error prone.

The objective of the new feature is to allow Admin users to assign locations to each match automatically across various locations while also deconflicting them.

Example:

We are have 3 tournaments for different skill levels. We have 3 courts. We want to spread the 15 (example) minute matches out across all 3 courts. However one tournament starts friday so that we can get everyone in.

We also only run the games between 10:00 AM and 8:00 PM (for example)

User Experience:

An admin can from the tournament page click a button that take them to the assignment page.

Once on the assignment page, the Admin will create locations (Just names / strings) and the they can select any tourmament that is in the finalizing stage (The bracket is complete, just pending start). They will also provide match duration, gap between matches, a time window (the times that games can actually be scheduled, can be further constrained on the first and last days of the tournament by start and end times, this may require udating the start and end date fields to include time),and perhaps some other varibles if needed by the algorithm.

Once they hit confirm, an algorithm (which we will need to write) will automatically apply a location to each match Metadata (as a new optional property) along with a time in another optional property (we won't render this right away, our first goal is to get the information assigned).

After the algorithm runs. they will be presented with a table:

Tournament Name, Match Id, Location Name, Time

They can then hit confirm to set these changes.