import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function InputCode() {
    return (
        <Card className="w-full max-w-sm">
            <CardHeader>
                <CardTitle>Save your code template</CardTitle>
                <CardAction>
                </CardAction>
            </CardHeader>
            <CardContent>
                <form>
                    <div className="flex flex-col gap-6">
                        <div className="grid gap-2">
                            <Label>Title</Label>
                            <Input
                                id="title"
                                type="text"
                                placeholder="Template name here ..."
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <div className="flex items-center">
                                <Label>Tags</Label>
                            </div>
                            <Input id="tags" type="text" required />
                        </div>
                        <div className="grid w-full max-w-sm items-center gap-3">
                            <Label htmlFor="picture">Picture</Label>
                            <Input id="picture" type="file" />
                        </div>
                        or
                        <div className="grid gap-2">
                            <div className="flex items-center">
                                <Label>Paste your code here</Label>
                            </div>
                            <Input id="codepaste" type="text" placeholder="public class Test{..." required />
                        </div>
                    </div>
                </form>
            </CardContent>
            <CardFooter className="flex gap-6 items-center justify-center">
                <Button type="submit">
                    Save
                </Button>
                <Button variant={"destructive"}>
                    Clear Entries
                </Button>
            </CardFooter>
        </Card>
    )
}
