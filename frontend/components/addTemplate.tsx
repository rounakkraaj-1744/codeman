import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react';

interface AddTemplateProps {
    onClick: ()=> void
}

export default function AddTemplate({onClick}: AddTemplateProps) {
    return (
        <div>
            <Button onClick={onClick} className='hover:cursor-pointer'>
                <Plus/>
                Add Code Template
            </Button>
        </div>
    )
}