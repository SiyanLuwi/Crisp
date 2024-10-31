import { collection, getDocs, getFirestore, doc, setDoc, getDoc, deleteDoc } from "firebase/firestore";
import { app } from "@/firebase/firebaseConfig";

const db = getFirestore(app);

export class Vote {

  public user_id: string;
  public vote: string;

  constructor(user_id: string, vote: string) {
    this.user_id = user_id;
    this.vote = vote;
  }

  //!!! PAPALITAN TO NANG NASA REPORTS.TSX yung const handleupvote then downvote


  // public static async handleUpvote(reportId: string, category: string, userId: string): Promise<void> {
  //   if(!userId){
  //     throw new Error("User id might be undefined!")
  //   }
  //   try {
  //     const voteRef = doc(db, `votes/${category}/reports/${reportId}/userVotes`, userId);
  //     const voteSnapshot = await getDoc(voteRef);
      
  //     if (voteSnapshot.exists()) {
  //       deleteDoc(voteRef)
  //       console.log("Existing vote deleted.");
  //       return; // Exit if the user has already voted
  //     }
  //     const newVote = new Vote(reportId, category, userId, "up");

  //     // Save the new vote
  //     await setDoc(voteRef, {
  //       user_id: newVote.user_id,
  //       report_id: newVote.report_id,
  //       vote: newVote.votes,
  //     });

  //     console.log("Upvote success!");
  //   } catch (error) {
  //     console.error("Error during upvote:", error);
  //   }
  // }

  public static async getAllVotes(): Promise<{ reportId: string; votes: Vote[] }[]> {
    const categories = ["fires", "street light", "potholes", "floods", "others", "road accidents"];
    const allVotes: { reportId: string; votes: Vote[] }[] = [];
  
    try {
      // Fetch all reports in parallel for each category
      await Promise.all(
        categories.map(async (category) => {
          const reportCollection = collection(db, `reports/${category}/reports`);
          const reportSnapshot = await getDocs(reportCollection);
  
          // Fetch votes for each report in parallel
          const reportVotesPromises = reportSnapshot.docs.map(async (reportDoc) => {
            const reportId = reportDoc.id;
            const votesCollection = collection(db, `reports/${category}/reports/${reportId}/votes`);
            const votesSnapshot = await getDocs(votesCollection);
  
            // Map vote documents to Vote instances
            const votes = votesSnapshot.docs.map((voteDoc) => {
              const voteData = voteDoc.data();
              return new Vote(voteData.user_id, voteData.vote);
            });
  
            return { reportId, votes };
          });
  
          // Wait for all vote fetching promises to resolve and add them to allVotes
          const reportVotes = await Promise.all(reportVotesPromises);
          allVotes.push(...reportVotes);
        })
      );
  
      return allVotes;
    } catch (error) {
      console.error("Error retrieving all votes:", error);
      return [];
    }
  }
  
  
}
