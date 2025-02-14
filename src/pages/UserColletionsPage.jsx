import TagInput from "../components/TagInput/TagInput";
import { useState } from "react";

export default function UserColletionsPage() {
    const [userTags, setUserTags] = useState([]);
    return (
<div className='UserColletionsPage-container'>
            UserColletionsPage
            <TagInput onTagsChange={setUserTags} />
            <p>Dodane tagi: {userTags.join(", ")}</p>
</div>
    );
}
