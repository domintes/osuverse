import TagInput from "../components/TagInput/TagInput";
import CustomTags from '../components/CustomTags/CustomTags';
import { useState } from "react";
import { testData } from '../test_data/maps';




export default function UserColletionsPage() {
    const [userTags, setUserTags] = useState([]);
    return (
        
<div className='UserColletionsPage-container'>
            UserColletionsPage
            <CustomTags items={testData} />
            <TagInput onTagsChange={setUserTags} />
            <p>Dodane tagi: {userTags.join(", ")}</p>
</div>
    );
}
