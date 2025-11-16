"use client";

import { PlusIcon, SearchIcon, SettingsIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@/components/ui/empty";
import {
	Field,
	FieldDescription,
	FieldGroup,
	FieldLabel,
	FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";

export function ThemeShowcase() {
	return (
		<div className="space-y-8" data-theme-preview>
			{/* Buttons */}
			<Card>
				<CardHeader>
					<CardTitle>Buttons</CardTitle>
					<CardDescription>Different button variants</CardDescription>
				</CardHeader>
				<CardContent className="flex flex-wrap gap-4">
					<Button>Primary</Button>
					<Button variant="secondary">Secondary</Button>
					<Button variant="outline">Outline</Button>
					<Button variant="ghost">Ghost</Button>
					<Button variant="destructive">Destructive</Button>
				</CardContent>
			</Card>

			{/* Input Groups */}
			<Card>
				<CardHeader>
					<CardTitle>Input Groups</CardTitle>
					<CardDescription>Inputs with addons</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<InputGroup>
						<InputGroupInput placeholder="Search..." />
						<InputGroupAddon>
							<SearchIcon className="size-4" />
						</InputGroupAddon>
					</InputGroup>

					<InputGroup>
						<InputGroupAddon>https://</InputGroupAddon>
						<InputGroupInput placeholder="example.com" />
					</InputGroup>
				</CardContent>
			</Card>

			{/* Button Groups */}
			<Card>
				<CardHeader>
					<CardTitle>Button Groups</CardTitle>
					<CardDescription>Grouped buttons</CardDescription>
				</CardHeader>
				<CardContent>
					<ButtonGroup>
						<Button variant="outline" size="sm">
							<SettingsIcon className="mr-2 size-4" />
							Settings
						</Button>
						<Button variant="outline" size="sm">
							<PlusIcon className="mr-2 size-4" />
							Add
						</Button>
					</ButtonGroup>
				</CardContent>
			</Card>

			{/* Form Fields */}
			<Card>
				<CardHeader>
					<CardTitle>Form Fields</CardTitle>
					<CardDescription>Input fields with labels</CardDescription>
				</CardHeader>
				<CardContent>
					<FieldGroup>
						<FieldSet>
							<Field>
								<FieldLabel htmlFor="name">Name</FieldLabel>
								<FieldDescription>Enter your full name</FieldDescription>
								<Input id="name" placeholder="John Doe" />
							</Field>
							<Field>
								<FieldLabel htmlFor="email">Email</FieldLabel>
								<FieldDescription>
									We&apos;ll never share your email
								</FieldDescription>
								<Input id="email" type="email" placeholder="john@example.com" />
							</Field>
						</FieldSet>
					</FieldGroup>
				</CardContent>
			</Card>

			{/* Badges & Status */}
			<Card>
				<CardHeader>
					<CardTitle>Badges & Status</CardTitle>
					<CardDescription>Status indicators</CardDescription>
				</CardHeader>
				<CardContent className="flex flex-wrap gap-4">
					<Badge>Default</Badge>
					<Badge variant="secondary">Secondary</Badge>
					<Badge variant="outline">Outline</Badge>
					<Badge variant="destructive">Destructive</Badge>
					<Badge>
						<Spinner className="mr-2 size-3" />
						Loading
					</Badge>
				</CardContent>
			</Card>

			{/* Switches */}
			<Card>
				<CardHeader>
					<CardTitle>Switches</CardTitle>
					<CardDescription>Toggle controls</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex items-center justify-between">
						<Label htmlFor="notifications">Enable notifications</Label>
						<Switch id="notifications" defaultChecked />
					</div>
					<div className="flex items-center justify-between">
						<Label htmlFor="dark-mode">Dark mode</Label>
						<Switch id="dark-mode" />
					</div>
				</CardContent>
			</Card>

			{/* Empty State */}
			<Card>
				<CardHeader>
					<CardTitle>Empty States</CardTitle>
					<CardDescription>No data scenarios</CardDescription>
				</CardHeader>
				<CardContent>
					<Empty>
						<EmptyHeader>
							<EmptyTitle>No items found</EmptyTitle>
							<EmptyDescription>
								Get started by creating a new item.
							</EmptyDescription>
						</EmptyHeader>
						<EmptyContent>
							<Button>
								<PlusIcon className="mr-2 size-4" />
								Create Item
							</Button>
						</EmptyContent>
					</Empty>
				</CardContent>
			</Card>

			{/* Separator */}
			<Card>
				<CardHeader>
					<CardTitle>Separator</CardTitle>
					<CardDescription>Visual dividers</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div>Content above</div>
					<Separator />
					<div>Content below</div>
				</CardContent>
			</Card>
		</div>
	);
}
