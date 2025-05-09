


function matchOrgan(Donor donor, Recipient recipient) public returns(bool) {
  if (donor.available && donor.organ == recipient.requiredOrgan && donor.bloodType == recipient.bloodType) {
      donor.available = false;
      recipient.matched = true;
      emit OrganMatched(donor.id, recipient.id);
      return true;
  }
  return false;
}