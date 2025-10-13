"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Separator } from "@/components/ui/separator"

export default function ShowcasePage() {
  const [sliderValue, setSliderValue] = React.useState([50])

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">shadcn/ui Component Showcase</h1>
          <p className="text-muted-foreground mt-2">
            Testing all installed components for AI Retirement Planner
          </p>
        </div>

        <Tabs defaultValue="buttons" className="space-y-8">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto">
            <TabsTrigger value="buttons">Buttons & Inputs</TabsTrigger>
            <TabsTrigger value="data">Data Display</TabsTrigger>
            <TabsTrigger value="overlays">Overlays</TabsTrigger>
            <TabsTrigger value="feedback">Feedback</TabsTrigger>
          </TabsList>

          <TabsContent value="buttons" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Buttons</CardTitle>
                <CardDescription>Different button variants and sizes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Button>Default</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="destructive">Destructive</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="link">Link</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm">Small</Button>
                  <Button size="default">Default</Button>
                  <Button size="lg">Large</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Form Inputs</CardTitle>
                <CardDescription>Text inputs, labels, and sliders</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="Enter your email" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Starting Balance</Label>
                  <Input id="currency" type="number" placeholder="R 100,000" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slider">Age Slider: {sliderValue[0]}</Label>
                  <Slider
                    id="slider"
                    min={18}
                    max={80}
                    step={1}
                    value={sliderValue}
                    onValueChange={setSliderValue}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Select Dropdown</CardTitle>
                <CardDescription>Dropdown selection component</CardDescription>
              </CardHeader>
              <CardContent>
                <Select>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a fund" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="balanced">Discovery Balanced Fund</SelectItem>
                    <SelectItem value="equity">Discovery Equity Fund</SelectItem>
                    <SelectItem value="bond">Discovery Bond Fund</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="data" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Table</CardTitle>
                <CardDescription>Data table with projection results</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Year</TableHead>
                      <TableHead>Age</TableHead>
                      <TableHead>Balance</TableHead>
                      <TableHead>Withdrawn</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>2025</TableCell>
                      <TableCell>30</TableCell>
                      <TableCell>R 100,000</TableCell>
                      <TableCell>R 0</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>2030</TableCell>
                      <TableCell>35</TableCell>
                      <TableCell>R 250,000</TableCell>
                      <TableCell>R 0</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>2055</TableCell>
                      <TableCell>60</TableCell>
                      <TableCell>R 2,500,000</TableCell>
                      <TableCell>R 120,000</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Accordion</CardTitle>
                <CardDescription>Collapsible content sections</CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>What is a Retirement Annuity (RA)?</AccordionTrigger>
                    <AccordionContent>
                      A Retirement Annuity is a long-term investment designed to provide financial security during retirement. It offers tax benefits on contributions and growth.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-2">
                    <AccordionTrigger>How does inflation affect my savings?</AccordionTrigger>
                    <AccordionContent>
                      Inflation erodes purchasing power over time. An inflation rate of 6% means you need 6% more money each year to buy the same goods.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-3">
                    <AccordionTrigger>What is CAGR?</AccordionTrigger>
                    <AccordionContent>
                      CAGR (Compound Annual Growth Rate) measures the average yearly growth of an investment, accounting for compounding effects.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="overlays" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Dialog</CardTitle>
                <CardDescription>Modal dialog for user actions</CardDescription>
              </CardHeader>
              <CardContent>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>Open Dialog</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Save Your Retirement Plan</DialogTitle>
                      <DialogDescription>
                        Give your plan a name so you can find it later.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="plan-name">Plan Name</Label>
                        <Input id="plan-name" placeholder="My Retirement Plan" />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline">Cancel</Button>
                      <Button>Save Plan</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sheet</CardTitle>
                <CardDescription>Side panel for navigation or additional content</CardDescription>
              </CardHeader>
              <CardContent>
                <Sheet>
                  <SheetTrigger asChild>
                    <Button>Open Sheet</Button>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>Your Saved Plans</SheetTitle>
                      <SheetDescription>
                        Load a previously saved retirement plan
                      </SheetDescription>
                    </SheetHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Recent Plans</p>
                        <div className="space-y-2">
                          <Button variant="outline" className="w-full justify-start">
                            Conservative Plan (2025-01-15)
                          </Button>
                          <Button variant="outline" className="w-full justify-start">
                            Aggressive Growth (2025-01-10)
                          </Button>
                          <Button variant="outline" className="w-full justify-start">
                            Balanced Strategy (2025-01-05)
                          </Button>
                        </div>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="feedback" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Badges</CardTitle>
                <CardDescription>Status indicators and labels</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge>Default</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                  <Badge variant="destructive">High Risk</Badge>
                  <Badge variant="outline">Cached Data</Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge>Recommended</Badge>
                  <Badge variant="secondary">Low Risk</Badge>
                  <Badge variant="destructive">Fund Depleted</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tooltips</CardTitle>
                <CardDescription>Hover or focus for additional context</CardDescription>
              </CardHeader>
              <CardContent>
                <TooltipProvider>
                  <div className="space-y-2">
                    <p className="text-sm">
                      Your{" "}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="underline decoration-dotted cursor-help">
                            CAGR
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">
                            Compound Annual Growth Rate - the average yearly return of your investment
                          </p>
                        </TooltipContent>
                      </Tooltip>
                      {" "}is 10.5% based on the selected fund.
                    </p>

                    <p className="text-sm">
                      The{" "}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="underline decoration-dotted cursor-help">
                            Sharpe Ratio
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">
                            Risk-adjusted return metric. Higher is better. Above 1.0 is considered good.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                      {" "}indicates risk-adjusted performance.
                    </p>
                  </div>
                </TooltipProvider>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Separator</CardTitle>
                <CardDescription>Visual dividers between content sections</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium">Section 1</h3>
                    <p className="text-sm text-muted-foreground">Content for the first section</p>
                  </div>
                  <Separator />
                  <div>
                    <h3 className="text-sm font-medium">Section 2</h3>
                    <p className="text-sm text-muted-foreground">Content for the second section</p>
                  </div>
                  <Separator />
                  <div>
                    <h3 className="text-sm font-medium">Section 3</h3>
                    <p className="text-sm text-muted-foreground">Content for the third section</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-8 p-4 border rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Dark Mode Test</h2>
          <p className="text-muted-foreground">
            Toggle your system dark mode to test theme switching. All components should adapt seamlessly.
          </p>
        </div>
      </div>
    </div>
  )
}
